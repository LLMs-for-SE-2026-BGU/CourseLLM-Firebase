import { Injectable, LoggerService, Scope } from "@nestjs/common";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import * as path from "path";

@Injectable({ scope: Scope.DEFAULT })
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    // Custom format to include file location, timestamp, level, and message
    const customFormat = winston.format.printf(
      ({ level, message, timestamp, context, location, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]`;

        if (location) {
          msg += ` [${location}]`;
        }

        if (context) {
          msg += ` [${context}]`;
        }

        msg += `: ${message}`;

        // Add metadata if present
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`;
        }

        return msg;
      },
    );

    // Daily rotating file transport configuration
    const dailyRotateFileTransport = new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "%DATE%.log"),
      datePattern: "YYYY_MM_DD_HH",
      maxFiles: "30d", // Keep logs for 30 days
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat,
      ),
    });

    // Console transport configuration
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat,
      ),
    });

    return winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      transports: [dailyRotateFileTransport, consoleTransport],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  private getCallerInfo(): string {
    const stack = new Error().stack;
    if (!stack) return "unknown";

    const lines = stack.split("\n");
    // Skip first 4 lines: Error, getCallerInfo, log method, actual caller
    const callerLine = lines[4];
    if (!callerLine) return "unknown";

    // Extract file and line number from stack trace
    const match = callerLine.match(/\((.+):(\d+):\d+\)/);
    if (match) {
      const filePath = match[1];
      const lineNumber = match[2];
      const fileName = path.basename(filePath);
      return `${fileName}:${lineNumber}`;
    }

    return "unknown";
  }

  debug(message: string, context?: string) {
    const location = this.getCallerInfo();
    this.logger.debug(message, {
      context: context || this.context,
      location,
    });
  }

  log(message: string, context?: string) {
    const location = this.getCallerInfo();
    this.logger.info(message, {
      context: context || this.context,
      location,
    });
  }

  info(message: string, context?: string) {
    const location = this.getCallerInfo();
    this.logger.info(message, {
      context: context || this.context,
      location,
    });
  }

  warn(message: string, context?: string) {
    const location = this.getCallerInfo();
    this.logger.warn(message, {
      context: context || this.context,
      location,
    });
  }

  error(message: string, trace?: string, context?: string) {
    const location = this.getCallerInfo();
    this.logger.error(message, {
      context: context || this.context,
      location,
      trace,
    });
  }
}
