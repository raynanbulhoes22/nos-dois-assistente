// Production-safe logging utility
// This replaces console.log statements in production builds

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  data?: any;
  userId?: string;
}

class ProductionLogger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: this.sanitizeData(data)
    };

    // In development, use console
    if (this.isDevelopment) {
      const consoleFn = console[level] || console.log;
      consoleFn(message, data);
    }

    // In production, buffer critical logs
    if (!this.isDevelopment && (level === 'error' || message.includes('security'))) {
      this.addToBuffer(entry);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return null;

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'cpf', 'email', 'phone', 'numero_wpp', 'auth'];
    
    try {
      const sanitized = JSON.parse(JSON.stringify(data));
      
      const clean = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        for (const key in obj) {
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            obj[key] = clean(obj[key]);
          }
        }
        return obj;
      };
      
      return clean(sanitized);
    } catch {
      return '[INVALID_DATA]';
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  // Get buffered logs for error reporting
  getBufferedLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Clear the buffer
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Create console replacement for production
export const productionConsole = {
  log: (message: string, ...args: any[]) => logger.info(message, args),
  info: (message: string, ...args: any[]) => logger.info(message, args),
  warn: (message: string, ...args: any[]) => logger.warn(message, args),
  error: (message: string, ...args: any[]) => logger.error(message, args),
  debug: (message: string, ...args: any[]) => {
    // Only log debug in development
    if (import.meta.env.DEV) {
      console.debug(message, ...args);
    }
  }
};