const LOG_COLORS = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Disable non-critical logs in production
if (process.env.NODE_ENV === 'production') {
  console.log('console.log() is disabled in production to prevent log spam. If you must log in production, use console.info().');
  console.log = () => {};
}

/**
 * Manages error and warning logging.
 *
 * When to use: reporting recoverable issues or fatal errors with consistent formatting.
 * Do NOT use for: normal control flow; prefer explicit return values or exceptions.
 *
 * @remarks
 * In production, `console.log` is disabled to reduce log spam; use `console.info` instead.
 * Pattern: log warnings for recoverable issues and use `ErrorHandler.fatalError` for unrecoverable state.
 * Anti-pattern: swallowing exceptions without logging context.
 *
 * **Category:** Utilities
 * @public
 */
export default class ErrorHandler {
  private static errorCount = 0;
  private static warningCount = 0;

  /**
   * Logs a formatted warning message to alert about potential issues
   * @param message - The warning message to display
   * @param context - Optional context information about the warning
   *
   * **Side effects:** Writes to stderr and increments the warning count.
   *
   * **Category:** Utilities
  */
  public static warning(message: string, context?: string): void {
    const warningError = new Error(message);
    this._logMessage({
      message,
      error: warningError,
      context,
      type: 'warning',
      isFatal: false,
    });
  }

  /**
   * Logs a formatted error message with stack trace to help debug issues
   * @param message - The error message to display
   * @param context - Optional context information about the error
   *
   * **Side effects:** Writes to stderr and increments the error count.
   *
   * **Category:** Utilities
  */
  public static error(message: string, context?: string): void {
    const error = new Error(message);
    this._logMessage({
      message,
      error,
      context,
      type: 'error',
      isFatal: false,
    });
  }

  /**
   * Logs a formatted fatal error message with stack trace and throws the error
   * @param message - The error message to display
   * @param context - Optional context information about the error
   * @throws The created Error object
   *
   * **Side effects:** Writes to stderr and throws, terminating the current execution path.
   *
   * **Category:** Utilities
  */
  public static fatalError(message: string, context?: string): never {
    const error = new Error(message);
    this._logMessage({
      message,
      error,
      context,
      type: 'error',
      isFatal: true,
    });    
    
    throw error;
  }

  /**
   * Enables global crash protection handlers in production.
   *
   * @remarks
   * Installs handlers for unhandled rejections and uncaught exceptions.
   *
   * **Side effects:** Registers process-level error handlers.
   *
   * **Category:** Utilities
   * @internal
   */
  public static enableCrashProtection(): void {
    if (process.env.NODE_ENV !== 'production') return;
    
    process.on('unhandledRejection', (reason: unknown) => {
      const message = reason instanceof Error ? reason.message : String(reason);
      this.error(`[CRASH PREVENTED] - Unhandled Promise Rejection: ${message}`);
    });

    process.on('uncaughtException', (error: Error) => {
      this.error(`[FATAL] Uncaught Exception: ${error.message}\n${error.stack}`);
      setTimeout(() => process.exit(1), 1000);
    });

    console.info('Crash protection enabled! Unhandled Promise Rejections and Uncaught Exceptions will be logged instead of crashing the server.');
  }

  /** @internal */
  private static _logMessage(options: {
    message: string,
    error: Error,
    context?: string,
    type: 'warning' | 'error',
    isFatal: boolean
  }): void {
    const { message, error, context, type, isFatal } = options;
    const timestamp = new Date().toISOString();
    const isWarning = type === 'warning';
    
    if (isWarning) {
      this.warningCount++;
    } else {
      this.errorCount++;
    }

    const headerColor = isWarning ? LOG_COLORS.yellow : LOG_COLORS.red;
    const count = isWarning ? this.warningCount : this.errorCount;
    const logMethod = isWarning ? console.warn : console.error;
    
    logMethod(`\n${headerColor}${LOG_COLORS.bold}==========[ RUNTIME ${isWarning ? 'WARNING' : 'ERROR'} #${count} | ${timestamp} ]==========${LOG_COLORS.reset}`);
    
    if (!isWarning) {
      if (isFatal) {
        logMethod('The server encountered an unrecoverable error and has crashed!\n');
      } else {
        logMethod('The server encountered a recoverable error and did not crash.');
        logMethod('You should fix this to prevent undefined-like return values and unexpected behavior.\n');
      }
    }

    const messageType = isFatal ? 'FATAL ERROR' : (isWarning ? 'WARNING' : 'ERROR');
    logMethod(`${headerColor}${LOG_COLORS.bold}⚠️  ${messageType}:${LOG_COLORS.reset} ${LOG_COLORS.bold}${message}${LOG_COLORS.reset}`);
    
    if (context) {
      logMethod(`${LOG_COLORS.cyan}ℹ️  CONTEXT:${LOG_COLORS.reset} ${context}`);
    }
    
    const stackLines = error.stack?.split('\n') ?? [];
    if (stackLines.length > 1) {
      logMethod(`${LOG_COLORS.cyan}🔍 STACK TRACE:${LOG_COLORS.reset}`);
      
      stackLines.slice(1).forEach(line => {
        const trimmedLine = line.trim();
        // Highlight function names and file locations in the stack trace
        const formattedLine = trimmedLine
          .replace(/at\s+([^\s]+)/, `at ${LOG_COLORS.green}$1${LOG_COLORS.reset}`)
          .replace(/\(([^:]+):(\d+):(\d+)\)/, `(${LOG_COLORS.cyan}$1${LOG_COLORS.reset}:${LOG_COLORS.yellow}$2:$3${LOG_COLORS.reset})`);
        
        logMethod(`   ${formattedLine}`);
      });
    }
    
    logMethod(`${headerColor}${LOG_COLORS.bold}=================================================${LOG_COLORS.reset}\n`);
  }
}
