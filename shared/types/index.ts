// Shared TypeScript types across all services
// Import in workflow engine and web app

export type UserRole = "TRADER" | "LMO" | "GATC" | "ADMIN" | "CONTROLLER";

export type InstrumentClass = "CLASS_I" | "CLASS_II" | "CLASS_III" | "CLASS_IIII";

export type TaskStatus =
  | "PENDING"
  | "ALLOCATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type CertificateStatus = "VALID" | "EXPIRED" | "REVOKED" | "REJECTED";

export type NotificationChannel = "SMS" | "WHATSAPP" | "EMAIL";

export interface IIN {
  value: string; // 16-digit string
}

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface FeeBreakdown {
  baseFee: number;       // Fb
  conveyanceFee: number; // Fc
  penaltyFee: number;    // Pq = Nq * Fb
  totalFee: number;      // Tf = Fb + Fc + Pq
  currency: "INR";
}

export interface Stakeholder {
  id: string;
  pan: string;
  gstin: string;
  email: string;
  role: UserRole;
  stateCode: string;
  districtCode: string;
  createdAt: string; // ISO 8601
}

export interface Instrument {
  iin: IIN;
  manufacturerSerial: string;
  modelApprovalRef: string;
  accuracyClass: InstrumentClass;
  gpsLocation: GeoCoordinate;
  ownerGstin: string;
  currentCertificateStatus: CertificateStatus;
  nextVerificationDue: string; // ISO 8601 date
}

export interface VerificationTask {
  taskId: string;
  applicationId: string;
  iin: IIN;
  assignedTo: string; // LMO or GATC officer ID
  districtCode: string;
  scheduledDate: string; // ISO 8601 date
  status: TaskStatus;
  createdAt: string;
}

export interface InspectionResult {
  taskId: string;
  iin: IIN;
  readings: number[];
  passed: boolean;
  gpsLocation: GeoCoordinate;
  photoUrls: string[];
  signatureUrl: string;
  submittedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string; // ISO 8601
}
