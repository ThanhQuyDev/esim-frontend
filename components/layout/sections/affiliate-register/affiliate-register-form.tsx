"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  Loader2,
  LogIn,
  Send,
} from "lucide-react";

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
import { localizedHref } from "@/lib/route-mapping";
import {
  createPartnerApplySchema,
  partnerApplyDefaultValues,
  PARTNER_CHANNELS,
  type PartnerApplyFormValues,
  type PartnerApplyValidationMessages,
} from "@/lib/schemas/partner-apply.schema";
import { applyAsPartner } from "@/lib/services/partners.service";

export interface AffiliateRegisterDict {
  pageTitle: string;
  pageSubtitle: string;
  sectionAccount: string;
  sectionAccountHelp: string;
  sectionChannel: string;
  sectionChannelHelp: string;
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
  notes: string;
  notesPlaceholder: string;
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

  const form = useForm<PartnerApplyFormValues>({
    resolver: zodResolver(createPartnerApplySchema(dict.validation)),
    defaultValues:
      partnerApplyDefaultValues as unknown as PartnerApplyFormValues,
    mode: "onBlur",
  });

  const legalType = form.watch("legalType");
  const isCompany = legalType === "company";

  const onSubmit = useCallback(
    async (values: PartnerApplyFormValues) => {
      setError(null);
      setSubmitting(true);

      // Channel details travel as one free-form object — the API stores
      // `channelInfo` as jsonb, so an empty channel adds nothing rather than
      // writing a row of nulls an admin has to read past.
      const channelInfo: Record<string, unknown> = { channel: values.channel };
      if (values.channelUrl) channelInfo.url = values.channelUrl;
      if (values.followers) channelInfo.followers = Number(values.followers);

      const result = await applyAsPartner({
        partnerType: "kol",
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
    [dict.apiErrors, dict.errorGeneric, form, isCompany]
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
                    {dict.followers}{" "}
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
                  <FormDescription>{dict.followersHelp}</FormDescription>
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
          disabled={submitting}
          data-testid="affiliate-register-submit"
        >
          {submitting ? (
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
      </form>
    </Form>
  );
}
