"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Home,
  Loader2,
  LogIn,
  Paperclip,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { localizedHref } from "@/lib/route-mapping";
import {
  createPartnerApplySchema,
  partnerApplyDefaultValues,
  PARTNER_CHANNELS,
  type PartnerApplyFormValues,
  type PartnerApplyValidationMessages,
} from "@/lib/schemas/partner-apply.schema";
import {
  PARTNER_DOCUMENT_MAX_BYTES,
  PARTNER_DOCUMENT_MAX_FILES,
  PARTNER_DOCUMENT_TYPES,
  applyAsPartner,
  uploadPartnerDocuments,
} from "@/lib/services/partners.service";

export interface AffiliateRegisterDict {
  pageTitle: string;
  pageSubtitle: string;
  sectionAccount: string;
  sectionAccountHelp: string;
  sectionChannel: string;
  sectionChannelHelp: string;
  partnerKind: string;
  partnerKindKol: string;
  partnerKindKolHelp: string;
  partnerKindDistribution: string;
  partnerKindDistributionHelp: string;
  partnerKindApi: string;
  partnerKindApiHelp: string;
  legalType: string;
  legalTypeIndividual: string;
  legalTypeIndividualHelp: string;
  legalTypeCompany: string;
  legalTypeCompanyHelp: string;
  contactName: string;
  contactNamePlaceholder: string;
  contactEmail: string;
  contactEmailPlaceholder: string;
  contactEmailHelp: string;
  contactPhone: string;
  contactPhonePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  passwordHelp: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  companyName: string;
  companyNamePlaceholder: string;
  taxCode: string;
  taxCodePlaceholder: string;
  businessAddress: string;
  businessAddressPlaceholder: string;
  channel: string;
  channelUrl: string;
  channelUrlPlaceholder: string;
  followers: string;
  followersPlaceholder: string;
  followersHelp: string;
  /** "Lượng truy cập mỗi tháng" — distribution / API applicants (doitac-1410 #049). */
  monthlyVisits: string;
  monthlyVisitsHelp: string;
  notes: string;
  notesPlaceholder: string;
  /** Attachments (doitac-1410 #013). */
  documents: string;
  documentsHint: string;
  documentsChoose: string;
  documentsRemove: string;
  documentsTooMany: string;
  documentsBadType: string;
  documentsTooBig: string;
  documentsUploading: string;
  documentsUploadFailed: string;
  channelOptions: Record<string, string>;
  acceptTerms: string;
  acceptTermsLink: string;
  /**
   * API error codes turned into sentences. The API answers a duplicate
   * application with the bare code `emailAlreadyExists` and no message, so
   * without this the applicant was shown the code itself.
   */
  apiErrors?: Record<string, string>;
  submit: string;
  submitting: string;
  required: string;
  optional: string;
  errorGeneric: string;
  success: {
    title: string;
    description: string;
    emailNotice: string;
    ctaLogin: string;
    ctaHome: string;
  };
  validation: PartnerApplyValidationMessages;
}

interface AffiliateRegisterFormProps {
  lang: string;
  dict: AffiliateRegisterDict;
}

/**
 * Affiliate application form (#095).
 *
 * `POST /partners/apply` has existed since the partner tables were built, but
 * nothing on the public site called it — the only way to join was for an admin
 * to create the record by hand. This is that missing screen.
 *
 * Applications land as `pending`; an admin approves or rejects them in the CMS
 * and the applicant is emailed the outcome either way, so the success panel
 * says to watch their inbox rather than implying instant access.
 */
export function AffiliateRegisterForm({
  lang,
  dict,
}: AffiliateRegisterFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Optional attachments, sent after the application with its own token
  // (doitac-1410 #013).
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    setFileError(null);
    const next = [...files];
    for (const file of Array.from(picked)) {
      if (!PARTNER_DOCUMENT_TYPES.includes(file.type)) {
        setFileError(`${file.name}: ${dict.documentsBadType}`);
        continue;
      }
      if (file.size > PARTNER_DOCUMENT_MAX_BYTES) {
        setFileError(`${file.name}: ${dict.documentsTooBig}`);
        continue;
      }
      if (next.length >= PARTNER_DOCUMENT_MAX_FILES) {
        setFileError(dict.documentsTooMany);
        break;
      }
      next.push(file);
    }
    setFiles(next);
  };

  const form = useForm<PartnerApplyFormValues>({
    resolver: zodResolver(createPartnerApplySchema(dict.validation)),
    defaultValues:
      partnerApplyDefaultValues as unknown as PartnerApplyFormValues,
    mode: "onBlur",
  });

  // The distribution and API partner pages send their readers here with
  // "?loai=distribution|api", so the form opens on that kind (doitac-1410 #014).
  useEffect(() => {
    const kind = new URLSearchParams(window.location.search).get("loai");
    if (kind === "kol" || kind === "distribution" || kind === "api") {
      form.setValue("partnerKind", kind as PartnerApplyFormValues["partnerKind"]);
    }
  }, [form]);

  const legalType = form.watch("legalType");
  const partnerKind = form.watch("partnerKind");
  const isCompany = legalType === "company";

  const onSubmit = useCallback(
    async (values: PartnerApplyFormValues) => {
      setError(null);
      setSubmitting(true);

      // Channel details travel as one free-form object — the API stores
      // `channelInfo` as jsonb, so an empty channel adds nothing rather than
      // writing a row of nulls an admin has to read past.
      const isKol = values.partnerKind === "kol";
      // Every kind tells us where they sell now — a distribution or API
      // applicant's channel and monthly traffic matter as much (doitac-1410 #049).
      const channelInfo: Record<string, unknown> = { channel: values.channel };
      if (values.channelUrl) channelInfo.url = values.channelUrl;
      if (values.followers) channelInfo.followers = Number(values.followers);

      const result = await applyAsPartner({
        // An API partner runs as a distribution partner; the exact choice
        // travels as requestedType for the admin (#053, test round 4).
        partnerType: isKol ? "kol" : "distribution",
        requestedType: values.partnerKind,
        legalType: values.legalType,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        password: values.password,
        // Company details only mean anything for a company applicant; sending
        // leftovers from a switched radio would file a KOL as a business.
        companyName: isCompany ? values.companyName : undefined,
        taxCode: isCompany ? values.taxCode : undefined,
        businessAddress: isCompany ? values.businessAddress : undefined,
        channelInfo,
        notes: values.notes,
      });

      setSubmitting(false);

      if (result.ok) {
        // The application stands on its own; a failed upload only means the
        // documents have to reach esim.vn another way, so it is said, not
        // treated as a failure of the whole form.
        if (files.length > 0) {
          if (result.documentUploadToken) {
            setUploading(true);
            const failure = await uploadPartnerDocuments(
              result.documentUploadToken,
              files
            );
            setUploading(false);
            if (failure) setUploadWarning(`${dict.documentsUploadFailed} (${failure})`);
          } else {
            setUploadWarning(dict.documentsUploadFailed);
          }
        }
        setSubmitted(true);
        return;
      }

      if (result.kind === "validation") {
        // The API sends codes, not sentences (the same convention as the
        // change-email flow). An unknown code falls back to its own text
        // rather than being swallowed — a wrong sentence beats a blank field.
        const translate = (code: string) =>
          dict.apiErrors?.[code] ?? code;

        const knownFields = [
          "contactName",
          "contactEmail",
          "contactPhone",
          "password",
          "companyName",
          "taxCode",
          "businessAddress",
          "notes",
        ] as const;
        let mapped = false;
        for (const [field, code] of Object.entries(result.errors)) {
          if ((knownFields as readonly string[]).includes(field)) {
            form.setError(field as keyof PartnerApplyFormValues, {
              type: "server",
              message: translate(code),
            });
            mapped = true;
          }
        }
        if (!mapped) {
          setError(
            Object.values(result.errors).map(translate).join(", ") ||
              dict.apiErrors?.unknown ||
              dict.errorGeneric
          );
        }
        return;
      }

      setError(result.message || dict.errorGeneric);
    },
    [dict.apiErrors, dict.errorGeneric, dict.documentsUploadFailed, files, form, isCompany]
  );

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center"
        data-testid="affiliate-register-success"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2
            className="h-8 w-8 text-emerald-600"
            aria-hidden="true"
          />
        </div>
        <h2 className="text-[1.7rem] sm:text-2xl font-semibold text-gray-900">
          {dict.success.title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-base sm:text-sm text-gray-600">
          {dict.success.description}
        </p>
        <p className="mx-auto mt-3 max-w-md text-base sm:text-sm text-gray-500">
          {dict.success.emailNotice}
        </p>
        {uploadWarning && (
          <p
            className="mx-auto mt-3 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            data-testid="affiliate-register-upload-warning"
          >
            {uploadWarning}
          </p>
        )}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="cursor-pointer">
            <Link href={localizedHref(lang, "/profile")}>
              <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
              {dict.success.ctaLogin}
            </Link>
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-8"
        data-testid="affiliate-register-form"
      >
        <div role="status" aria-live="polite" aria-atomic="true">
          {error && (
            <div
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
              data-testid="affiliate-register-error"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <p className="text-base sm:text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* ---- Which partnership (#053, test round 4) ---- */}
        <section className="space-y-3" data-testid="partner-kind">
          <FormField
            control={form.control}
            name="partnerKind"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-900">
                  {dict.partnerKind} <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      { value: "kol", label: dict.partnerKindKol, help: dict.partnerKindKolHelp },
                      {
                        value: "distribution",
                        label: dict.partnerKindDistribution,
                        help: dict.partnerKindDistributionHelp,
                      },
                      { value: "api", label: dict.partnerKindApi, help: dict.partnerKindApiHelp },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                        field.value === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="partnerKind"
                        className="mt-1 h-4 w-4 accent-primary"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        data-testid={`partner-kind-${option.value}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {option.help}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* ---- Who is applying ---- */}
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.sectionAccount}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {dict.sectionAccountHelp}
            </p>
          </div>

          <FormField
            control={form.control}
            name="legalType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.legalType} <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        value: "individual",
                        label: dict.legalTypeIndividual,
                        help: dict.legalTypeIndividualHelp,
                      },
                      {
                        value: "company",
                        label: dict.legalTypeCompany,
                        help: dict.legalTypeCompanyHelp,
                      },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                        field.value === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        className="mt-1 h-4 w-4 accent-primary"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        data-testid={`legal-type-${option.value}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {option.help}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.contactName} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={dict.contactNamePlaceholder}
                      data-testid="contact-name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.contactPhone} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder={dict.contactPhonePlaceholder}
                      data-testid="contact-phone"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.contactEmail} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={dict.contactEmailPlaceholder}
                    data-testid="contact-email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>{dict.contactEmailHelp}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.password} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={dict.passwordPlaceholder}
                      data-testid="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{dict.passwordHelp}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.confirmPassword}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={dict.confirmPasswordPlaceholder}
                      data-testid="confirm-password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Company block: shown only when it applies, so an individual KOL
              never faces a tax-code field they cannot fill (#095). */}
          {isCompany && (
            <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/60 p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dict.companyName}{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dict.companyNamePlaceholder}
                          data-testid="company-name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {dict.taxCode} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={dict.taxCodePlaceholder}
                          data-testid="tax-code"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dict.businessAddress}{" "}
                      <span className="text-gray-400">({dict.optional})</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dict.businessAddressPlaceholder}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </section>

        {/* ---- How they will promote ---- */}
        <section className="space-y-5">
          {/* Every kind fills in its channel (doitac-1410 #049); for a
              distribution or API applicant the audience is monthly traffic. */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.sectionChannel}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {dict.sectionChannelHelp}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dict.channel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      data-testid="channel-select"
                      {...field}
                    >
                      {PARTNER_CHANNELS.map((channel) => (
                        <option key={channel} value={channel}>
                          {dict.channelOptions[channel] ?? channel}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {partnerKind === "kol" ? dict.followers : dict.monthlyVisits}{" "}
                    <span className="text-gray-400">({dict.optional})</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder={dict.followersPlaceholder}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {partnerKind === "kol" ? dict.followersHelp : dict.monthlyVisitsHelp}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="channelUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.channelUrl}{" "}
                  <span className="text-gray-400">({dict.optional})</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={dict.channelUrlPlaceholder}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {dict.notes}{" "}
                  <span className="text-gray-400">({dict.optional})</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder={dict.notesPlaceholder}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional attachments (doitac-1410 #013). */}
          <div className="space-y-2" data-testid="affiliate-register-documents">
            {/* Same type as the form's own labels, which run larger on phones. */}
            <Label>
              {dict.documents}{" "}
              <span className="text-gray-400">({dict.optional})</span>
            </Label>
            <p className="text-base sm:text-sm text-muted-foreground">{dict.documentsHint}</p>
            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`${dict.documentsRemove} ${file.name}`}
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {files.length < PARTNER_DOCUMENT_MAX_FILES && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary">
                <Paperclip className="h-4 w-4" aria-hidden="true" />
                {dict.documentsChoose}
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            {fileError && (
              <p className="text-sm text-red-600" role="alert">
                {fileError}
              </p>
            )}
          </div>
        </section>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  data-testid="accept-terms"
                />
                <span className="text-sm text-gray-600">
                  {dict.acceptTerms}{" "}
                  <Link
                    href={localizedHref(lang, "/terms-of-service")}
                    className="text-primary underline underline-offset-2"
                    target="_blank"
                  >
                    {dict.acceptTermsLink}
                  </Link>
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer sm:w-auto"
          disabled={submitting || uploading}
          data-testid="affiliate-register-submit"
        >
          {submitting || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {uploading ? dict.documentsUploading : dict.submitting}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {dict.submit}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
