import { describe, it, expect } from "vitest";
import { allocateTask, getTask } from "../src/services/allocation.js";

describe("allocateTask", () => {
  it("allocates a task and returns a taskId", async () => {
    const result = await allocateTask({
      applicationId: "APP-001",
      districtCode: "MH-PUNE",
      instrumentClass: "CLASS_III",
      preferGatc: false,
    });
    expect(result.taskId).toBeTruthy();
    expect(result.status).toBe("ALLOCATED");
    expect(result.assignedTo).toBeTruthy();
    expect(result.scheduledDate).toBeTruthy();
  });

  it("can retrieve the task by taskId", async () => {
    const result = await allocateTask({
      applicationId: "APP-002",
      districtCode: "MH-MUMBAI",
      instrumentClass: "CLASS_I",
      preferGatc: false,
    });
    const fetched = await getTask(result.taskId);
    expect(fetched).toBeDefined();
    expect(fetched?.taskId).toBe(result.taskId);
  });

  it("returns undefined for unknown taskId", async () => {
    const result = await getTask("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("respects district-specific officer pool", async () => {
    const result = await allocateTask({
      applicationId: "APP-003",
      districtCode: "UP-LUCKNOW",
      instrumentClass: "CLASS_II",
      preferGatc: false,
    });
    expect(result.assignedTo).toMatch(/^LMO-UP-/);
  });

  it("falls back to default officers for unknown district", async () => {
    const result = await allocateTask({
      applicationId: "APP-004",
      districtCode: "XX-UNKNOWN",
      instrumentClass: "CLASS_II",
      preferGatc: false,
    });
    expect(result.assignedTo).toMatch(/^LMO-DEFAULT-/);
  });
});
