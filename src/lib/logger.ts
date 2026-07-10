/**
 * 구조화된 로깅 유틸리티
 *
 * 기존에 각 파일에 흩어져 있던 `console.error("[함수명] 설명:", error)` 형태의
 * ad-hoc 로깅을 대체한다. JSON 한 줄로 timestamp/level/context/message/error(stack 포함)를
 * 출력하여 로그 파싱 및 검색을 용이하게 한다.
 *
 * 과도한 추상화(외부 로그 전송, 레벨 필터링 설정 등)는 MVP 범위를 벗어나므로 포함하지 않는다.
 */

type LogLevel = "error" | "warn" | "info";

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  /** 로그가 발생한 함수/모듈 위치 (예: "getInvoiceByToken", "AdminPage") */
  context: string;
  message: string;
  error?: SerializedError;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: "UnknownError", message: String(error) };
}

function write(level: LogLevel, context: string, message: string, error?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

/**
 * 구조화 로거 — 콘솔에 JSON 한 줄로 출력한다.
 *
 * 사용 예:
 *   logger.error("getInvoiceByToken", "Notion 조회 실패", error)
 */
export const logger = {
  error: (context: string, message: string, error?: unknown) => write("error", context, message, error),
  warn: (context: string, message: string, error?: unknown) => write("warn", context, message, error),
  info: (context: string, message: string, error?: unknown) => write("info", context, message, error),
};
