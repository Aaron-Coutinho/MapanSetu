import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    service: "workflow-engine",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  }));
};
