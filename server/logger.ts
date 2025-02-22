import { format } from "date-fns";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private formatTimestamp(): string {
    return format(new Date(), "yyyy-MM-dd HH:mm:ss");
  }

  private addLog(level: LogLevel, message: string, details?: unknown) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      details
    };

    this.logs.unshift(entry);
    
    // Keep only the last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Also log to console for development
    console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`);
    if (details) {
      console.log(details);
    }
  }

  info(message: string, details?: unknown) {
    this.addLog("info", message, details);
  }

  warn(message: string, details?: unknown) {
    this.addLog("warn", message, details);
  }

  error(message: string, details?: unknown) {
    this.addLog("error", message, details);
  }

  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  getRecentErrors(limit = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === "error")
      .slice(0, limit);
  }
}

export const logger = new Logger();
