/**
 * @fileoverview High-Fidelity Professional System Logger.
 * 
 * Provides structured, timestamped console logging with log levels,
 * component scoping, and silent production modes.
 * 
 * @module utils/logger
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  scope: string;
  level: LogLevel;
  message: string;
  details?: unknown;
}

class SystemLogger {
  private isDevelopment =
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

  private formatMessage(scope: string, message: string): string {
    const time = new Date().toISOString().split("T")[1].slice(0, 8);
    return `[${time}] [WhaleScope:${scope}] ${message}`;
  }

  public debug(scope: string, message: string, details?: unknown): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(scope, message);
      if (details !== undefined) {
        console.debug(`%c${formatted}`, "color: #94a3b8;", details);
      } else {
        console.debug(`%c${formatted}`, "color: #94a3b8;");
      }
    }
  }

  public info(scope: string, message: string, details?: unknown): void {
    const formatted = this.formatMessage(scope, message);
    if (details !== undefined) {
      console.info(`%c${formatted}`, "color: #06b6d4; font-weight: 500;", details);
    } else {
      console.info(`%c${formatted}`, "color: #06b6d4; font-weight: 500;");
    }
  }

  public warn(scope: string, message: string, details?: unknown): void {
    const formatted = this.formatMessage(scope, message);
    if (details !== undefined) {
      console.warn(`%c${formatted}`, "color: #f59e0b; font-weight: 600;", details);
    } else {
      console.warn(`%c${formatted}`, "color: #f59e0b; font-weight: 600;");
    }
  }

  public error(scope: string, message: string, error?: unknown): void {
    const formatted = this.formatMessage(scope, message);
    if (error !== undefined) {
      console.error(`%c${formatted}`, "color: #ef4444; font-weight: 700;", error);
    } else {
      console.error(`%c${formatted}`, "color: #ef4444; font-weight: 700;");
    }
  }
}

export const logger = new SystemLogger();

