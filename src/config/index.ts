import dotenv from "dotenv";
import { Config } from "@/interfaces/config.interface";

dotenv.config({ path: ".env" });

const config: Config = {
  app: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    jwtSecret: process.env.SECRET_KEY!,
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
  database: {
    url: process.env.DATABASE_URL!,
    redisHost: process.env.REDIS_HOST!,
    redisPort: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : 6379,
  },
};

export default config;
