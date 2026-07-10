/**
 * 어드민 로그인 Rate Limit 관련 공용 상수.
 *
 * "use server" 파일(src/app/admin/actions.ts)은 async 함수만 export할 수 있으므로
 * (React Server Functions 제약), 클라이언트(admin/page.tsx)와 공유해야 하는
 * 에러 메시지 상수는 이 파일에 별도로 둔다.
 */
export const RATE_LIMIT_ERROR_MESSAGE = "RATE_LIMIT_EXCEEDED";
