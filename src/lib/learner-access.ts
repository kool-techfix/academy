/**
 * Learner access rules shared by the learner services and their routes.
 * NOT_ENROLLED keeps its existing wording — every learner route already
 * maps it to 403.
 */
export const NOT_ENROLLED = "You are not enrolled in this course";

export const MODULE_LOCKED =
  "Complete the previous module's quiz before starting this module.";

export const RETAKE_NOT_ALLOWED =
  "You've already taken this final assessment, and it doesn't allow retakes. You can restart the course to try again.";

export const RESTART_NOT_AVAILABLE =
  "You can only restart a course after failing a final assessment that doesn't allow retakes.";

/** Status for the access errors above, or null for anything else. */
export function learnerAccessErrorStatus(error: unknown): number | null {
  const message = error instanceof Error ? error.message : "";

  if (message === NOT_ENROLLED || message === MODULE_LOCKED) return 403;
  if (message === RETAKE_NOT_ALLOWED || message === RESTART_NOT_AVAILABLE) {
    return 409;
  }
  if (message === "Module not found") return 404;

  return null;
}
