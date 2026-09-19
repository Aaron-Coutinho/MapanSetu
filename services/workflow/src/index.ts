import app from "./app.js";
import { config } from "./config.js";

const start = async () => {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`Workflow Engine running on port ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
