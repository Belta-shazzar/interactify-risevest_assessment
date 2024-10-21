import { logger } from "@/utils/logger";
import Redis from "ioredis";
import config from "@/config";

let redis: Redis | null = null;

export const initRedis = () => {
  if (!redis) {
    redis = new Redis({
      host:
        config.app.node_env === "production"
          ? config.database.redisHost
          : "localhost",
      port: config.database.redisPort,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("connect", () => {
      logger.info("🗄️  Redis connection successful");
    });

    redis.on("error", (err) => {
      logger.error("Redis connection error:", err);
    });
  }
  return redis;
};

export const closeRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

export const getRedis = () => {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
};

export default getRedis();
