export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogContext {
  userId?: string
  tenantId?: string
  requestId?: string
  [key: string]: any
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ""
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`
  }

  static debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  static info(message: string, context?: LogContext) {
    console.log(this.formatMessage(LogLevel.INFO, message, context))
  }

  static warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context))
  }

  static error(message: string, error?: Error, context?: LogContext) {
    console.error(this.formatMessage(LogLevel.ERROR, message, context))
    if (error) {
      console.error("Error details:", error)
      console.error("Stack trace:", error.stack)
    }
  }
}
