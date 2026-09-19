/**
 * Application lifecycle state machine.
 * Source: context/System Flow Lifecycle Architecture.md — State Transition Matrix
 *
 * Shared by Workflow, Inspection, and Certificate services. Encode once here
 * so no service invents its own transitions.
 */

export const APPLICATION_STATES = [
  "DRAFT",
  "PENDING_ALLOCATION",
  "SCHEDULED",
  "INSPECTION_PASS",
  "INSPECTION_FAIL",
  "CERTIFIED",
  "EXPIRING_SOON",
  "EXPIRED",
] as const;

export type ApplicationState = (typeof APPLICATION_STATES)[number];

/** Allowed transitions. Anything not listed here is rejected. */
export const TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  DRAFT: ["PENDING_ALLOCATION"],
  PENDING_ALLOCATION: ["SCHEDULED"],
  SCHEDULED: ["INSPECTION_PASS", "INSPECTION_FAIL"],
  INSPECTION_PASS: ["CERTIFIED"],
  INSPECTION_FAIL: ["PENDING_ALLOCATION"], // re-apply after recalibration
  CERTIFIED: ["EXPIRING_SOON", "EXPIRED"],
  EXPIRING_SOON: ["CERTIFIED", "EXPIRED"], // renewed or lapsed
  EXPIRED: ["PENDING_ALLOCATION"], // renewal application
};

export function canTransition(from: ApplicationState, to: ApplicationState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: ApplicationState, to: ApplicationState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal state transition: ${from} -> ${to}`);
  }
}
