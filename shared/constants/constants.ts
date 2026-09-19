// Shared constants for TypeScript services (workflow engine, web app)

export const SERVICE_PORTS = {
  iam:           8080,
  inspection:    8081,
  registry:      8090,
  workflow:      3001,
  feeEngine:     8001,
  notifications: 8002,
  certificate:   8003,
  web:           3000,
} as const;

export const EXPIRY_REMINDER_DAYS = [60, 30, 15] as const;

export const IIN_LENGTH = 16;

export const MAX_CONSECUTIVE_INSPECTIONS_SAME_LMO = 2;

export const INSTRUMENT_CLASSES = [
  "CLASS_I",
  "CLASS_II",
  "CLASS_III",
  "CLASS_IIII",
] as const;

export const USER_ROLES = [
  "TRADER",
  "LMO",
  "GATC",
  "ADMIN",
  "CONTROLLER",
] as const;
