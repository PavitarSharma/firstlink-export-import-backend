import { createLogger, format, transports } from "winston";

const { colorize, combine, timestamp, json, printf } = format;

export const logger = createLogger({
  format: combine(
    colorize(),
    timestamp(),
    json(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
});
