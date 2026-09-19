import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { taskRoutes } from "./routes/tasks.js";
import { healthRoutes } from "./routes/health.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: "*" });

await app.register(swagger, {
  openapi: {
    info: {
      title: "MapanSetu — Workflow Engine",
      description: "Task allocation, anti-bias LMO routing, and scheduling",
      version: "0.1.0",
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: "/docs",
});

await app.register(healthRoutes);
await app.register(taskRoutes, { prefix: "/api/v1" });

export default app;
