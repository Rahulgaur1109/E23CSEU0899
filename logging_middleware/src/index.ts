type LogStack = "frontend" | "backend";
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

type LogPayload = {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
};

const LOGS_ENDPOINT = "http://4.224.186.213/evaluation-service/logs";
let authToken: string | null = null;
const MAX_MESSAGE_LEN = 48;
const MAX_PENDING_LOGS = 50;
const pendingLogs: LogPayload[] = [];
let isFlushing = false;

const normalizeMessage = (value: string) => {
  if (value.length <= MAX_MESSAGE_LEN) return value;
  return value.slice(0, MAX_MESSAGE_LEN - 3) + "...";
};

export const setLogToken = (token: string | null) => {
  authToken = token;
  if (authToken) {
    void flushPendingLogs();
  }
};

const enqueueLog = (payload: LogPayload) => {
  if (pendingLogs.length >= MAX_PENDING_LOGS) {
    pendingLogs.shift();
  }
  pendingLogs.push(payload);
};

const sendLog = async (payload: LogPayload) => {
  if (!authToken) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: authToken,
  };

  const res = await fetch(LOGS_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    const detail = errorText ? ` - ${errorText}` : "";
    throw new Error(`Log request failed: ${res.status}${detail}`);
  }
};

const flushPendingLogs = async () => {
  if (isFlushing || pendingLogs.length === 0 || !authToken) return;
  isFlushing = true;

  try {
    while (pendingLogs.length > 0) {
      const payload = pendingLogs.shift();
      if (!payload) continue;
      await sendLog(payload);
    }
  } finally {
    isFlushing = false;
  }
};

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  const payload: LogPayload = {
    stack: stack as LogStack,
    level: level as LogLevel,
    package: pkg as LogPackage,
    message: normalizeMessage(message),
  };

  if (!authToken) {
    enqueueLog(payload);
    return;
  }

  try {
    await sendLog(payload);
  } catch (err) {
    try {
      const fallback = err instanceof Error ? err.message : "unknown error";
      console.log(`[log-fallback] ${payload.level}: ${payload.message} (${fallback})`);
    } catch {
      // Swallow any secondary failures from console.log
    }
  }
}
