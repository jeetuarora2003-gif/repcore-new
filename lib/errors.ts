import { ZodError } from "zod";

type ErrorWithCode = {
  code?: string;
  message?: string;
  details?: string | null;
};

function mapDatabaseMessage(message: string): string {
  if (message.includes("members_gym_phone_unique")) {
    return "A member with this phone number already exists in this gym.";
  }

  if (message.includes("idx_attendance_unique_daily_ist")) {
    return "This member is already checked in today.";
  }

  if (message.includes("invoice_number")) {
    return "Could not create the invoice number. Please try again.";
  }

  if (message.includes("receipt_number")) {
    return "Could not create the receipt number. Please try again.";
  }

  if (message.includes("Payment amount must be greater than zero")) {
    return "Amount must be greater than zero.";
  }

  return message;
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Please review the entered details.";
  }

  if (error instanceof Error) {
    return mapDatabaseMessage(error.message);
  }

  const maybeError = error as ErrorWithCode | undefined;
  if (maybeError?.message) {
    return mapDatabaseMessage(maybeError.message);
  }

  return "Something went wrong. Please try again.";
}
