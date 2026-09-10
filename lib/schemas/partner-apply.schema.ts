import { z } from "zod";

/**
 * Validation messages for the affiliate application form, passed in from the
 * dictionary so the copy stays translatable (#095).
 */
export interface PartnerApplyValidationMessages {
  contactNameRequired: string;
  contactNameMax: string;
  contactEmailRequired: string;
  contactEmailInvalid: string;
  contactPhoneRequired: string;
  contactPhoneInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMismatch: string;
  companyNameRequired: string;
  taxCodeRequired: string;
  channelUrlInvalid: string;
  followersInvalid: string;
  notesMax: string;
  termsRequired: string;
}

/** Vietnamese mobile/landline, with or without the +84 form. */
const PHONE_REGEX = /^(?:\+?84|0)\d{8,10}$/;

/** Mirrors the API's `@MinLength(6)` on `password`. */
export const PARTNER_PASSWORD_MIN = 6;

export const PARTNER_CHANNELS = [
  "tiktok",
  "facebook",
  "youtube",
  "instagram",
  "website",
  "other",
] as const;

export type PartnerChannel = (typeof PARTNER_CHANNELS)[number];

/**
 * Build the application schema with localized messages.
 *
 * Company details are only required when the applicant registers as a company:
 * an individual KOL has no tax code, and demanding one would stop most of the
 * people this programme is aimed at.
 */
export function createPartnerApplySchema(
  messages: PartnerApplyValidationMessages
) {
  const optionalString = () =>
    z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined));

  return z
    .object({
      legalType: z.enum(["individual", "company"]),

      contactName: z
        .string({ required_error: messages.contactNameRequired })
        .trim()
        .min(1, { message: messages.contactNameRequired })
        .max(255, { message: messages.contactNameMax }),

      contactEmail: z
        .string({ required_error: messages.contactEmailRequired })
        .trim()
        .min(1, { message: messages.contactEmailRequired })
        .email({ message: messages.contactEmailInvalid }),

      contactPhone: z
        .string({ required_error: messages.contactPhoneRequired })
        .trim()
        .min(1, { message: messages.contactPhoneRequired })
        .refine((v) => PHONE_REGEX.test(v.replace(/[\s.]/g, "")), {
          message: messages.contactPhoneInvalid,
        }),

      password: z
        .string({ required_error: messages.passwordRequired })
        .min(PARTNER_PASSWORD_MIN, { message: messages.passwordMin }),

      confirmPassword: z.string({ required_error: messages.passwordRequired }),

      companyName: optionalString(),
      taxCode: optionalString(),
      businessAddress: optionalString(),

      channel: z.enum(PARTNER_CHANNELS),
      channelUrl: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v && v.length > 0 ? v : undefined))
        .refine((v) => v === undefined || /^https?:\/\/\S+$/i.test(v), {
          message: messages.channelUrlInvalid,
        }),
      followers: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v && v.length > 0 ? v : undefined))
        .refine((v) => v === undefined || /^\d{1,12}$/.test(v), {
          message: messages.followersInvalid,
        }),

      notes: z
        .string()
        .trim()
        .max(2000, { message: messages.notesMax })
        .optional()
        .transform((v) => (v && v.length > 0 ? v : undefined)),

      acceptTerms: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (values.password !== values.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: messages.passwordMismatch,
        });
      }

      if (values.legalType === "company") {
        if (!values.companyName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyName"],
            message: messages.companyNameRequired,
          });
        }
        if (!values.taxCode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["taxCode"],
            message: messages.taxCodeRequired,
          });
        }
      }

      if (!values.acceptTerms) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["acceptTerms"],
          message: messages.termsRequired,
        });
      }
    });
}

export type PartnerApplyFormValues = z.infer<
  ReturnType<typeof createPartnerApplySchema>
>;

/** Input shape, before the schema's transforms. */
export const partnerApplyDefaultValues = {
  legalType: "individual" as const,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  taxCode: "",
  businessAddress: "",
  channel: "tiktok" as PartnerChannel,
  channelUrl: "",
  followers: "",
  notes: "",
  acceptTerms: false,
};
