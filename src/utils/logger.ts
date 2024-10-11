import config from "@/config";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";
import winstonDaily from "winston-daily-rotate-file";

// logs directory
const logDir: string = join(__dirname, config.logs.directory);

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const { combine, timestamp, printf, splat, colorize } = format;

const logFormat = printf(
  ({ timestamp, level, message }) => `${timestamp} [${level}]:: ${message}`
);

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error", // log file /logs/error/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
  ],
});

logger.add(
  new transports.Console({
    format: combine(splat(), colorize()),
  })
);

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  },
};

export { logger, stream };
