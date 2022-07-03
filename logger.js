import { createLogger, format, transports } from "winston";
import { ENV, LOG_LEVEL } from "./config/config.js";

const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: "hr-portal" },
  transports: [new transports.File({ filename: "error.log", level: "error" })],
});

if (ENV !== "prod") {
  logger.add(
    new transports.Console({
      format: format.json(),
    })
  );
}

export { logger };
