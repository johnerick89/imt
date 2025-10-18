import { ZodError, ZodIssue } from "zod";

export interface ParsedError {
  field: string;
  message: string;
}

/**
 * Parses Zod validation errors into meaningful, user-friendly messages.
 *
 * @param error - The error thrown by a Zod schema validation
 * @returns An array of parsed field errors with messages
 */
export function parseZodError(error: unknown): ParsedError[] {
  if (!(error instanceof ZodError)) {
    return [{ field: "unknown", message: "An unexpected error occurred." }];
  }

  return error.issues.map((err: ZodIssue) => {
    const fieldPath = err.path.join(".") || "root";
    let message = err.message;

    switch (err.code) {
      case "invalid_type":
        message = `Expected ${err.expected} for field '${fieldPath}'.`;
        break;

      case "too_small":
        message = `Value for '${fieldPath}' is too small. Minimum allowed is ${err.minimum}.`;
        break;

      case "too_big":
        message = `Value for '${fieldPath}' is too large. Maximum allowed is ${err.maximum}.`;
        break;

      case "invalid_format":
        if (err.format === "uuid") {
          message = `Invalid UUID format for '${fieldPath}'.`;
        } else if (err.format === "email") {
          message = `Invalid email format for '${fieldPath}'.`;
        } else {
          message = `Invalid format for '${fieldPath}'.`;
        }
        break;

      case "not_multiple_of":
        message = `Value for '${fieldPath}' must be a multiple of ${err.input}.`;
        break;

      case "unrecognized_keys":
        message = `Unrecognized keys found in '${fieldPath}': ${(
          err.keys || []
        ).join(", ")}.`;
        break;

      case "invalid_union":
        message = `Invalid input for union type at '${fieldPath}'.`;
        break;

      case "invalid_key":
      case "invalid_element":
      case "invalid_value":
        message = `Invalid value for '${fieldPath}'.`;
        break;

      case "custom":
        message = err.message || `Invalid input for '${fieldPath}'.`;
        break;

      default:
        message = `Invalid input for '${fieldPath}'.`;
        break;
    }

    return { field: fieldPath, message };
  });
}

/**
 * Example of formatting the parsed errors for an API JSON response.
 */
export function zodErrorResponse(error: unknown) {
  const parsed = parseZodError(error);
  return {
    success: false,
    errors: parsed,
    message:
      parsed.length === 1
        ? parsed[0].message
        : "Validation failed for one or more fields.",
  };
}
