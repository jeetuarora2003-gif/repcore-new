import { z } from "zod";
import { normalizeIndianPhone } from "@/lib/phone";

const uuidSchema = z.string().uuid("Invalid identifier.");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");
const paymentMethodSchema = z.enum(["cash", "upi", "card", "bank_transfer"]);

const trimmedString = z.string().trim();
const optionalText = trimmedString.optional().transform((value) => value ?? "");

const requiredPhoneSchema = trimmedString.transform((value, ctx) => {
  const normalized = normalizeIndianPhone(value);
  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid 10-digit Indian phone number.",
    });
    return z.NEVER;
  }

  return normalized;
});

const optionalPhoneSchema = trimmedString.optional().transform((value, ctx) => {
  if (!value) return "";

  const normalized = normalizeIndianPhone(value);
  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid 10-digit Indian phone number.",
    });
    return z.NEVER;
  }

  return normalized;
});

export const createMemberSchema = z.object({
  gym_id: uuidSchema,
  full_name: trimmedString.min(2, "Enter the member's full name."),
  phone: requiredPhoneSchema,
  email: z.string().email("Enter a valid email address.").or(z.literal("")).optional().transform((value) => value ?? ""),
  joining_date: dateSchema,
  notes: optionalText,
});

export const membershipSaleSchema = z.object({
  gym_id: uuidSchema,
  full_name: trimmedString.min(2, "Enter the member's full name."),
  phone: requiredPhoneSchema,
  email: z.string().email("Enter a valid email address.").or(z.literal("")).optional().transform((value) => value ?? ""),
  notes: optionalText,
  deviceEnrollmentId: optionalText,
  photoUrl: optionalText,
  planId: uuidSchema,
  startDate: dateSchema,
  paymentMethod: paymentMethodSchema,
  amountPaid: z.coerce.number().min(0, "Amount paid cannot be negative."),
});

export const subscriptionSchema = z.object({
  memberId: uuidSchema,
  planId: uuidSchema,
  startDate: dateSchema,
  gymId: uuidSchema,
});

export const paymentSchema = z.object({
  gym_id: uuidSchema,
  member_id: uuidSchema,
  invoice_id: uuidSchema.optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  payment_method: paymentMethodSchema,
  notes: optionalText,
});

export const planSchema = z.object({
  gym_id: uuidSchema,
  name: trimmedString.min(2, "Enter a plan name."),
  duration_days: z.coerce.number().int("Duration must be a whole number.").positive("Duration must be at least 1 day."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});

export const gymSettingsSchema = z.object({
  name: trimmedString.min(2, "Enter the gym name.").optional(),
  address: optionalText,
  phone: optionalPhoneSchema,
  logo_url: optionalText,
  whatsapp_api_key: optionalText,
  receipt_prefix: trimmedString.min(1, "Receipt prefix is required.").max(10, "Receipt prefix is too long.").optional(),
  invoice_prefix: trimmedString.min(1, "Invoice prefix is required.").max(10, "Invoice prefix is too long.").optional(),
});

export const whatsappModeSchema = z.object({
  gymId: uuidSchema,
  mode: z.enum(["manual", "auto"]),
});

export const whatsappConfigSchema = z.object({
  gymId: uuidSchema,
  phone: requiredPhoneSchema,
  apiKey: trimmedString.min(1, "Enter your WhatsApp API key."),
  mode: z.literal("auto"),
});
