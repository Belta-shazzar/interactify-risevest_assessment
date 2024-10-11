import 'dotenv/config'
import { Config } from "@/interfaces/config.interface";

const config: Config = {
  app: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    jwtSecret: process.env.JWT_SECRET!,
    node_env: process.env.NODE_ENV!,
  },
  cors: {
    origin: process.env.CORS_ORIGIN!,
    credentials: Boolean(process.env.CORS_CREDENTIALS!),
  },
  logs: {
    format: process.env.LOG_FORMAT!,
    directory: process.env.LOG_DIR!,
  },
};

export default config;
