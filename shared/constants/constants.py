# Shared constants — import from here, never hardcode in services

# --- Instrument Classes ---
INSTRUMENT_CLASSES = ["CLASS_I", "CLASS_II", "CLASS_III", "CLASS_IIII"]

# --- MPE Thresholds (Maximum Permissible Error, in grams) ---
MPE_THRESHOLDS = {
    "CLASS_I":    {"low": 0.5,  "medium": 1.0, "high": 1.5},
    "CLASS_II":   {"low": 1.0,  "medium": 2.0, "high": 3.0},
    "CLASS_III":  {"low": 2.0,  "medium": 4.0, "high": 6.0},
    "CLASS_IIII": {"low": 3.0,  "medium": 6.0, "high": 9.0},
}

# --- Service Ports ---
SERVICE_PORTS = {
    "iam":           8080,
    "inspection":    8081,
    "registry":      8090,
    "workflow":      3001,
    "fee_engine":    8001,
    "notifications": 8002,
    "certificate":   8003,
    "web":           3000,
}

# --- Notification Intervals (days before expiry) ---
EXPIRY_REMINDER_DAYS = [60, 30, 15]

# --- IIN ---
IIN_LENGTH = 16

# --- Anti-bias Rule ---
MAX_CONSECUTIVE_INSPECTIONS_SAME_LMO = 2

# --- JWT ---
JWT_ALGORITHM = "RS256"
JWT_EXPIRY_MINUTES = 60

# --- Payment ---
EGRAS_WEBHOOK_TIMEOUT_SECONDS = 5
