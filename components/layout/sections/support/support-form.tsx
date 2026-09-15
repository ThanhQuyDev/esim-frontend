"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertTriangle, Loader2, Send, Mail, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { localizedHref } from "@/lib/route-mapping";

import {
  createTicketFormSchema,
  ticketFormDefaultValues,
  type TicketFormValues,
  type TicketValidationMessages,
} from "@/lib/schemas/ticket.schema";
import { submitTicket } from "@/lib/services/tickets.service";
import { uploadFile } from "@/lib/services/files.service";
import type { AttachmentItem } from "@/lib/types/ticket";
import {
  checkSubmission,
  loadHistory,
  recordSubmission,
  retryAfterMinutes,
  retryAfterSeconds,
  submissionFingerprint,
  type SpamReason,
  type SubmissionRecord,
} from "@/lib/support-anti-spam";

import { FileUploadZone } from "./file-upload-zone";

// ----------- i18n shape -----------

export interface SupportFormDict {
  pageTitle: string;
  pageSubtitle: string;
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  email: string;
  emailPlaceholder: string;
  emailHelp: string;
  subject: string;
  subjectPlaceholder: string;
  orderId: string;
  orderIdPlaceholder: string;
  orderIdHelp: string;
  deviceModel: string;
  deviceModelPlaceholder: string;
  iccid: string;
  iccidPlaceholder: string;
  iccidHelp: string;
  planDestination: string;
  planDestinationPlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  descriptionCounter: string;
  attachments: string;
  attachmentsHelp: string;
  attachmentsAccept: string;
  attachmentsBrowse: string;
  attachmentsRemove: string;
  attachmentsTooMany: string;
  attachmentsTooLarge: string;
  attachmentsInvalidType: string;
  submit: string;
  submitting: string;
  uploading: string;
  /** Spam-guard copy (#075). Optional so an older dictionary still renders. */
  antiSpam?: {
    honeypotLabel: string;
    blockedTitle: string;
    tooFast: string;
    rateLimited: string;
    duplicate: string;
    blockedHelp: string;
  };
  required: string;
  optional: string;
  privacyNotice: string;
  validation: TicketValidationMessages;
  toast: {
    successTitle: string;
    successDescription: string;
    errorGeneric: string;
    errorUpload: string;
  };
  success: {
    title: string;
    description: string;
    ticketId: string;
    ctaNew: string;
    ctaHome: string;
  };
}


// ----------- Helpers -----------

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    key in vars ? String(vars[key]) : ""
  );
}

/** Fallback copy so the guard still speaks if a dictionary lags behind (#075). */
const ANTI_SPAM_FALLBACK: Record<"vi" | "en", NonNullable<SupportFormDict["antiSpam"]>> = {
  vi: {
    honeypotLabel: "Để trống ô này",
    blockedTitle: "Chưa gửi được yêu cầu",
    tooFast: "Bạn gửi quá nhanh. Vui lòng đợi {{seconds}} giây rồi gửi lại.",
    rateLimited:
      "Bạn đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau {{minutes}} phút.",
    duplicate:
      "Yêu cầu này vừa được gửi rồi. Vui lòng chờ phản hồi, hoặc sửa nội dung nếu muốn bổ sung thông tin.",
    blockedHelp: "Nếu bạn cần hỗ trợ gấp, hãy dùng khung chat ở góc màn hình.",
  },
  en: {
    honeypotLabel: "Leave this field empty",
    blockedTitle: "Request not sent",
    tooFast: "That was too quick. Please wait {{seconds}} seconds and try again.",
    rateLimited:
      "You have sent several requests in a short time. Please try again in {{minutes}} minutes.",
    duplicate:
      "You just sent this exact request. Please wait for our reply, or edit it if you want to add something.",
    blockedHelp: "If it is urgent, use the chat bubble in the corner of the screen.",
  },
};

// ----------- Banner -----------

type Banner =
  | { kind: "success"; title: string; description: string }
  | { kind: "error"; title: string; description?: string }
  | null;

interface SupportFormProps {
  lang: "vi" | "en" | string;
  dict: SupportFormDict;
  /** Optional: when omitted, form stays on page and shows inline success card */
  successHref?: string;
}

export function SupportForm({ lang, dict, successHref }: SupportFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const schema = useMemo(
    () => createTicketFormSchema(dict.validation),
    [dict.validation]
  );

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: ticketFormDefaultValues as unknown as TicketFormValues,
    mode: "onBlur",
  });

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [phase, setPhase] = useState<"idle" | "uploading" | "submitting">("idle");
  const [banner, setBanner] = useState<Banner>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | number | null>(
    null
  );
  const formTopRef = useRef<HTMLDivElement>(null);

  // ----- Spam guard (#075) -----
  const antiSpam =
    dict.antiSpam ?? ANTI_SPAM_FALLBACK[lang === "en" ? "en" : "vi"];
  /** Hidden field: humans never see it, bots fill every input they find. */
  const [honeypot, setHoneypot] = useState("");
  /** When this form appeared — a request written faster than that is a script. */
  const mountedAtRef = useRef<number>(Date.now());
  const [history, setHistory] = useState<SubmissionRecord[]>([]);

  // Past submissions live in localStorage, so a reload does not reset the
  // count. Read after mount to keep the server and client markup identical.
  useEffect(() => {
    setHistory(loadHistory(typeof window === "undefined" ? undefined : window.localStorage));
  }, []);

  const spamMessage = useCallback(
    (reason: SpamReason, retryAfterMs: number): string => {
      switch (reason) {
        case "tooFast":
          return interpolate(antiSpam.tooFast, {
            seconds: retryAfterSeconds(retryAfterMs),
          });
        case "rateLimited":
          return interpolate(antiSpam.rateLimited, {
            minutes: retryAfterMinutes(retryAfterMs),
          });
        case "duplicate":
          return antiSpam.duplicate;
        case "honeypot":
        default:
          // Say something honest rather than silently swallowing the request:
          // on the vanishing chance a human tripped this, they can still reach
          // support through the chat widget.
          return antiSpam.blockedHelp;
      }
    },
    [antiSpam],
  );

  // Auto-fill email when authenticated
  useEffect(() => {
    if (user?.email && !form.getValues("customerEmail")) {
      form.setValue("customerEmail", user.email, { shouldDirty: false });
    }
  }, [user, form]);

  const description = form.watch("description") ?? "";
  const descriptionLength = description.length;

  const isBusy = phase !== "idle";

  const handleAttachmentValidation = useCallback((msg: string) => {
    setBanner({ kind: "error", title: msg });
  }, []);

  const onSubmit = useCallback(
    async (values: TicketFormValues) => {
      setBanner(null);

      // 0) Spam guard — runs before anything is uploaded or sent (#075)
      const fingerprint = submissionFingerprint(values);
      const verdict = checkSubmission({
        honeypot,
        elapsedMs: Date.now() - mountedAtRef.current,
        fingerprint,
        history,
      });
      if (!verdict.ok) {
        setBanner({
          kind: "error",
          title: antiSpam.blockedTitle,
          description: spamMessage(verdict.reason, verdict.retryAfterMs),
        });
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // 1) Upload attachments (sequential to keep server load predictable)
      let uploadedUrls: string[] = [];
      if (attachments.length > 0) {
        setPhase("uploading");

        // Mark all queued items as uploading
        setAttachments((prev) =>
          prev.map((it) =>
            it.status === "queued" ? { ...it, status: "uploading" } : it
          )
        );

        try {
          const queue: AttachmentItem[] = attachments.map((it) => ({
            ...it,
            status: it.status === "uploaded" ? "uploaded" : "uploading",
          }));

          for (let i = 0; i < queue.length; i += 1) {
            const item = queue[i];
            if (item.status === "uploaded" && item.uploadedUrl) {
              uploadedUrls.push(item.uploadedUrl);
              continue;
            }
            try {
              const url = await uploadFile(item.file);
              queue[i] = { ...item, status: "uploaded", uploadedUrl: url };
              uploadedUrls.push(url);
            } catch (err) {
              const message = err instanceof Error ? err.message : "Upload failed";
              queue[i] = { ...item, status: "error", error: message };
              setAttachments([...queue]);
              setPhase("idle");
              setBanner({
                kind: "error",
                title: dict.toast.errorUpload,
                description: message,
              });
              formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
          }
          setAttachments(queue);
        } catch (err) {
          setPhase("idle");
          setBanner({
            kind: "error",
            title: dict.toast.errorUpload,
            description: err instanceof Error ? err.message : undefined,
          });
          return;
        }
      }

      // 2) Submit ticket
      setPhase("submitting");
      const result = await submitTicket({
        customerEmail: values.customerEmail,
        subject: values.subject,
        description: values.description,
        orderId: values.orderId,
        deviceModel: values.deviceModel,
        iccid: values.iccid,
        planDestination: values.planDestination,
        attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        // Sent so the server can refuse it too — the browser check alone is
        // skipped by anything posting to the API directly (#033).
        website: honeypot.trim() || undefined,
      });
      setPhase("idle");

      if (result.ok) {
        // Count it towards the per-browser limit, and remember the fingerprint
        // so an identical resend is caught as a duplicate (#075).
        setHistory(
          recordSubmission(
            typeof window === "undefined" ? undefined : window.localStorage,
            fingerprint,
          ),
        );
        mountedAtRef.current = Date.now();

        // Cleanup attachments object URLs
        attachments.forEach((it) => {
          if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        });
        setAttachments([]);
        setSubmittedTicketId(result.ticket.id);
        form.reset(ticketFormDefaultValues as unknown as TicketFormValues);
        // Re-fill email if user is logged in
        if (user?.email) {
          form.setValue("customerEmail", user.email, { shouldDirty: false });
        }
        setBanner({
          kind: "success",
          title: dict.toast.successTitle,
          description: interpolate(dict.toast.successDescription, {
            id: String(result.ticket.id),
          }),
        });
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

        if (successHref) {
          router.push(`${successHref}?id=${encodeURIComponent(String(result.ticket.id))}`);
        }
        return;
      }

      // Validation 422 → map to fields
      if (result.kind === "validation") {
        const knownFields = [
          "customerEmail",
          "subject",
          "description",
          "orderId",
          "deviceModel",
          "iccid",
          "planDestination",
          "attachments",
        ] as const;
        let mappedAny = false;
        for (const [field, message] of Object.entries(result.errors)) {
          if ((knownFields as readonly string[]).includes(field)) {
            form.setError(field as keyof TicketFormValues, {
              type: "server",
              message,
            });
            mappedAny = true;
          }
        }
        if (!mappedAny) {
          setBanner({
            kind: "error",
            title: dict.toast.errorGeneric,
            description: Object.values(result.errors).join(", "),
          });
        } else {
          setBanner({ kind: "error", title: dict.toast.errorGeneric });
        }
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // The server's own spam guard refused it (#033): use the same wording as
      // the browser check, not a bare "Request failed (429)".
      if (result.status === 429 || result.status === 409) {
        setBanner({
          kind: "error",
          title: antiSpam.blockedTitle,
          description:
            result.status === 429
              ? spamMessage("rateLimited", result.retryAfterMs ?? 60_000)
              : spamMessage("duplicate", 0),
        });
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // Generic error
      setBanner({
        kind: "error",
        title: dict.toast.errorGeneric,
        description: result.message,
      });
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [
      antiSpam,
      attachments,
      dict,
      form,
      history,
      honeypot,
      router,
      spamMessage,
      successHref,
      user,
    ]
  );

  const resetEntireFlow = useCallback(() => {
    setSubmittedTicketId(null);
    setBanner(null);
    // A fresh form means a fresh fill-time clock (#075).
    mountedAtRef.current = Date.now();
    setHoneypot("");
    form.reset(ticketFormDefaultValues as unknown as TicketFormValues);
    if (user?.email) {
      form.setValue("customerEmail", user.email, { shouldDirty: false });
    }
  }, [form, user]);

  // ----------- Inline success card -----------

  if (submittedTicketId !== null && !successHref) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="text-[1.7rem] sm:text-2xl font-semibold text-gray-900">{dict.success.title}</h2>
        <p className="mx-auto mt-2 max-w-md text-base sm:text-sm text-gray-600">
          {dict.success.description}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          {interpolate(dict.success.ticketId, { id: String(submittedTicketId) })}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={resetEntireFlow} className="cursor-pointer">
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            {dict.success.ctaNew}
          </Button>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link href={localizedHref(lang, "/")}>
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              {dict.success.ctaHome}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ----------- Form -----------

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        <div ref={formTopRef} aria-hidden="true" />

        {/* Honeypot (#075): off-screen, skipped by keyboard and screen readers,
            so only a script that fills every input will touch it. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="support-website">{antiSpam.honeypotLabel}</label>
          <input
            id="support-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            data-testid="support-honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Banner (live region for both success + error) */}
        <div role="status" aria-live="polite" aria-atomic="true">
          {banner && (
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4",
                banner.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-900"
              )}
            >
              {banner.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-sm font-semibold">{banner.title}</p>
                {banner.description && (
                  <p className="mt-1 text-base sm:text-sm opacity-90">{banner.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {dict.email} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={dict.emailPlaceholder}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormDescription>{dict.emailHelp}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {dict.subject} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={255}
                  placeholder={dict.subjectPlaceholder}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Two-column row on md+ */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Order ID */}
          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.orderId}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({dict.optional})
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    maxLength={100}
                    placeholder={dict.orderIdPlaceholder}
                    disabled={isBusy}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>{dict.orderIdHelp}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Device Model */}
          <FormField
            control={form.control}
            name="deviceModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.deviceModel}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({dict.optional})
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    maxLength={100}
                    placeholder={dict.deviceModelPlaceholder}
                    disabled={isBusy}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ICCID */}
          <FormField
            control={form.control}
            name="iccid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.iccid}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({dict.optional})
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={20}
                    placeholder={dict.iccidPlaceholder}
                    disabled={isBusy}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      // Strip non-digit characters as the user types
                      const cleaned = e.target.value.replace(/\D/g, "");
                      field.onChange(cleaned);
                    }}
                  />
                </FormControl>
                <FormDescription>{dict.iccidHelp}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Plan Destination */}
          <FormField
            control={form.control}
            name="planDestination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.planDestination}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({dict.optional})
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    maxLength={100}
                    placeholder={dict.planDestinationPlaceholder}
                    disabled={isBusy}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {dict.description} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  maxLength={5000}
                  placeholder={dict.descriptionPlaceholder}
                  disabled={isBusy}
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormMessage />
                <span
                  className={cn(
                    "ml-auto text-sm tabular-nums",
                    descriptionLength > 5000
                      ? "text-red-500"
                      : descriptionLength > 4500
                        ? "text-amber-600"
                        : "text-gray-400"
                  )}
                  aria-live="polite"
                >
                  {interpolate(dict.descriptionCounter, {
                    count: descriptionLength,
                    max: 5000,
                  })}
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Attachments */}
        <div className="space-y-2">
          <FormLabel asChild>
            <p className="text-base sm:text-sm font-medium leading-none">
              {dict.attachments}{" "}
              <span className="text-sm font-normal text-gray-400">
                ({dict.optional})
              </span>
            </p>
          </FormLabel>
          <FileUploadZone
            items={attachments}
            onChange={setAttachments}
            onValidationError={handleAttachmentValidation}
            disabled={isBusy}
            labels={{
              title: dict.attachments,
              helpText: dict.attachmentsHelp,
              acceptText: dict.attachmentsAccept,
              browse: dict.attachmentsBrowse,
              remove: dict.attachmentsRemove,
              tooMany: dict.attachmentsTooMany,
              tooLarge: (name, limitMb) =>
                interpolate(dict.attachmentsTooLarge, { name, size: limitMb }),
              invalidType: (name) =>
                interpolate(dict.attachmentsInvalidType, { name }),
            }}
          />
        </div>

        {/* Submit + Privacy */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full cursor-pointer sm:w-auto border border-primary"
            disabled={isBusy || !form.formState.isValid && form.formState.isSubmitted}
          >
            {phase === "uploading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {dict.uploading}
              </>
            ) : phase === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {dict.submitting}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                {dict.submit}
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500">{dict.privacyNotice}</p>
        </div>
      </form>
    </Form>
  );
}
