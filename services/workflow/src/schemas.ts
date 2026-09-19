import { z } from "zod";

export const InstrumentClass = z.enum([
  "CLASS_I",
  "CLASS_II",
  "CLASS_III",
  "CLASS_IIII",
]);

export const TaskStatus = z.enum([
  "PENDING",
  "ALLOCATED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export const AllocationRequestSchema = z.object({
  applicationId: z.string().min(1),
  districtCode: z.string().min(1),
  instrumentClass: InstrumentClass,
  preferGatc: z.boolean().default(false),
});

export const AllocationResponseSchema = z.object({
  taskId: z.string(),
  assignedTo: z.string(),
  assignedType: z.enum(["LMO", "GATC"]),
  districtCode: z.string(),
  scheduledDate: z.string(),
  status: TaskStatus,
  createdAt: z.string(),
});

export type AllocationRequest = z.infer<typeof AllocationRequestSchema>;
export type AllocationResponse = z.infer<typeof AllocationResponseSchema>;
export type TaskStatusType = z.infer<typeof TaskStatus>;
