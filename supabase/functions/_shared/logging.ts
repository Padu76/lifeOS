export interface LogContext {
  userId?: string;
  sessionId?: string;
  function?: string;
  operation?: string;
}

export function logInfo(message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  console.log(`[INFO] ${timestamp} | ${message}${contextStr}`);
}

export function logError(message: string, error: any, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  const errorStr = error instanceof Error ? error.message : String(error);
  console.error(`[ERROR] ${timestamp} | ${message} | ${errorStr}${contextStr}`);
}

export function logWarning(message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  console.warn(`[WARN] ${timestamp} | ${message}${contextStr}`);
}
