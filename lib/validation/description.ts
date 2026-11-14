import { z } from "zod";
import { AppError } from "@/lib/api/error";

/** Longest project, task or milestone description, counted in Markdown characters. */
export const DESCRIPTION_MAX_LENGTH = 20_000;
/** The form starts showing a character count from here. */
export const DESCRIPTION_COUNT_FROM = 18_000;

export const DESCRIPTION_TOO_LONG = `Description must be ${DESCRIPTION_MAX_LENGTH.toLocaleString("en-GB")} characters or fewer.`;

/** Form field schema, shared by the add and edit forms. */
export const descriptionField = z
  .string()
  .max(DESCRIPTION_MAX_LENGTH, { message: DESCRIPTION_TOO_LONG })
  .nullable();

const descriptionInput = z
  .string({ message: "Description must be text." })
  .max(DESCRIPTION_MAX_LENGTH, { message: DESCRIPTION_TOO_LONG })
  .nullish();

/**
 * The description to store, from an API body. Missing or null becomes "".
 * Anything that isn't text, or is too long, is a 400 rather than a database error.
 */
export function parseDescription(value: unknown): string {
  const result = descriptionInput.safeParse(value);
  if (!result.success) throw new AppError(result.error.issues[0].message, 400);
  return result.data ?? "";
}
