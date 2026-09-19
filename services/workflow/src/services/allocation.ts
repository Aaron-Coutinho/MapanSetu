/**
 * Anti-bias task allocation engine.
 *
 * Rules (from context/Technical Approach.md):
 * 1. Route by district jurisdiction polygon
 * 2. Balance workload across available LMOs/GATCs
 * 3. Anti-bias: same LMO cannot inspect same establishment
 *    for more than MAX_CONSECUTIVE_INSPECTIONS_SAME_LMO consecutive cycles
 */

import { randomUUID } from "crypto";
import type { AllocationRequest, AllocationResponse } from "../schemas.js";

const MAX_CONSECUTIVE = 2;

// In-memory store for prototype — swap to PostgreSQL for production
const taskStore = new Map<string, AllocationResponse>();

// Stub officer roster per district — replace with DB query
const OFFICERS_BY_DISTRICT: Record<string, string[]> = {
  "MH-PUNE":    ["LMO-MH-001", "LMO-MH-002", "LMO-MH-003"],
  "MH-MUMBAI":  ["LMO-MH-004", "LMO-MH-005"],
  "UP-LUCKNOW": ["LMO-UP-001", "LMO-UP-002"],
  "RJ-JAIPUR":  ["LMO-RJ-001", "LMO-RJ-002"],
};

const DEFAULT_OFFICERS = ["LMO-DEFAULT-001", "LMO-DEFAULT-002"];

// Track how many consecutive times each LMO was assigned to each application
const consecutiveMap = new Map<string, number>(); // key: `${officerId}:${applicationId}`

function getOfficersForDistrict(districtCode: string): string[] {
  return OFFICERS_BY_DISTRICT[districtCode] ?? DEFAULT_OFFICERS;
}

function selectOfficer(
  officers: string[],
  applicationId: string,
  preferGatc: boolean
): { officerId: string; type: "LMO" | "GATC" } {
  // Filter out officers who've hit the anti-bias limit for this application
  const eligible = officers.filter((o) => {
    const key = `${o}:${applicationId}`;
    return (consecutiveMap.get(key) ?? 0) < MAX_CONSECUTIVE;
  });

  const pool = eligible.length > 0 ? eligible : officers; // fallback if all at limit
  // Round-robin by picking least-used (simplified for prototype)
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Update consecutive count
  const key = `${chosen}:${applicationId}`;
  consecutiveMap.set(key, (consecutiveMap.get(key) ?? 0) + 1);

  // PROTO: treat as GATC if preferGatc and officer id contains GATC prefix
  const type = preferGatc && chosen.startsWith("GATC") ? "GATC" : "LMO";
  return { officerId: chosen, type };
}

function nextBusinessDay(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3); // 3 business days
  return d.toISOString().split("T")[0];
}

export async function allocateTask(
  req: AllocationRequest
): Promise<AllocationResponse> {
  const officers = getOfficersForDistrict(req.districtCode);
  const { officerId, type } = selectOfficer(
    officers,
    req.applicationId,
    req.preferGatc
  );

  const task: AllocationResponse = {
    taskId: randomUUID(),
    assignedTo: officerId,
    assignedType: type,
    districtCode: req.districtCode,
    scheduledDate: nextBusinessDay(),
    status: "ALLOCATED",
    createdAt: new Date().toISOString(),
  };

  taskStore.set(task.taskId, task);
  return task;
}

export async function getTask(
  taskId: string
): Promise<AllocationResponse | undefined> {
  return taskStore.get(taskId);
}
