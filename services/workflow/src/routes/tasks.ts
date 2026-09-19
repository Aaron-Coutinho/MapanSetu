import type { FastifyPluginAsync } from "fastify";
import { AllocationRequestSchema } from "../schemas.js";
import { allocateTask, getTask } from "../services/allocation.js";

export const taskRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/tasks/allocate
  app.post("/tasks/allocate", async (req, reply) => {
    const parsed = AllocationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: parsed.error.flatten() });
    }
    const result = await allocateTask(parsed.data);
    return reply.status(200).send(result);
  });

  // GET /api/v1/tasks/:taskId
  app.get<{ Params: { taskId: string } }>(
    "/tasks/:taskId",
    async (req, reply) => {
      const task = await getTask(req.params.taskId);
      if (!task) {
        return reply.status(404).send({ error: "Task not found" });
      }
      return task;
    }
  );
};
