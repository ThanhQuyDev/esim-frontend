import { z } from "zod";

/**
 * Translator type accepted by the schema factory.
 * We pass in dict.support.form.validation so messages are i18n-aware.
 */
export interface TicketValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  subjectRequired: string;
  subjectMin: string;
  subjectMax: string;
  descriptionRequired: string;
  descriptionMin: string;
  descriptionMax: string;
  orderIdMax: string;
  deviceModelMax: string;
  iccidPattern: string;
  planDestinationMax: string;
  attachmentsMax: string;
}

const ICCID_REGEX = /^\d{19,20}$/;

/**
 * Build a Zod schema for the support-ticket form using localized messages.
 *
 * Optional fields are normalized: empty strings become `undefined` so they
 * are not sent in the JSON payload.
 */
export function createTicketFormSchema(messages: TicketValidationMessages) {
  const optionalString = (max: number, maxMessage: string) =>
    z
      .string()
      .trim()
      .max(max, { message: maxMessage })
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined));

  return z.object({
    customerEmail: z
      .string({ required_error: messages.emailRequired })
      .trim()
      .min(1, { message: messages.emailRequired })
      .email({ message: messages.emailInvalid }),

    subject: z
      .string({ required_error: messages.subjectRequired })
      .trim()
      .min(5, { message: messages.subjectMin })
      .max(255, { message: messages.subjectMax }),

    description: z
      .string({ required_error: messages.descriptionRequired })
      .trim()
      .min(20, { message: messages.descriptionMin })
      .max(5000, { message: messages.descriptionMax }),

    orderId: optionalString(100, messages.orderIdMax),
    deviceModel: optionalString(100, messages.deviceModelMax),

    iccid: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined))
      .refine((v) => v === undefined || ICCID_REGEX.test(v), {
        message: messages.iccidPattern,
      }),

    planDestination: optionalString(100, messages.planDestinationMax),

    attachments: z
      .array(z.string().url())
      .max(5, { message: messages.attachmentsMax })
      .optional(),
  });
}

/** Output type of the schema (after transform/refine) */
export type TicketFormValues = z.infer<
  ReturnType<typeof createTicketFormSchema>
>;

/** Default values for the form (input shape, before transform) */
export const ticketFormDefaultValues = {
  customerEmail: "",
  subject: "",
  description: "",
  orderId: "",
  deviceModel: "",
  iccid: "",
  planDestination: "",
  attachments: [] as string[],
};
