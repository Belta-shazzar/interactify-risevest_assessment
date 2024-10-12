import { logger } from "@/utils/logger";
import Redis from "ioredis";
import config from "@/config";

const redis = new Redis({
  host: config.database.redisHost,
  port: 6379,
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

export default redis;
