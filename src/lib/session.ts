/**
 * 어드민 세션 토큰 생성/검증 유틸리티
 *
 * 별도 세션 스토리지(DB, Redis 등) 없이 HMAC-SHA256으로 서명한 만료시각을
 * 쿠키 값으로 사용하는 stateless 세션 방식이다.
 * - 새 npm 의존성을 추가하지 않기 위해 Node 내장 crypto 모듈만 사용한다.
 * - 서명 비밀키는 `ADMIN_PASSWORD` 환경변수를 재사용한다(신규 환경변수 추가 금지).
 *   비밀번호가 바뀌면 서명 검증이 자동으로 실패하므로 기존 세션이 함께 무효화되는
 *   부수 효과가 있는데, 이는 의도된 설계다.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

/** 만료시각(ms) 문자열에 대한 HMAC-SHA256 서명(hex)을 계산한다. */
function sign(expiresAtMs: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update(expiresAtMs).digest("hex");
}

/**
 * 세션 쿠키에 저장할 토큰을 생성한다.
 * 형식: `${expiresAtMs}.${signatureHex}`
 */
export function createSessionToken(): string {
  const expiresAtMs = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAtMs}.${sign(expiresAtMs)}`;
}

/**
 * 세션 토큰의 유효성을 검증한다.
 * - 토큰이 없거나 형식이 올바르지 않으면 false
 * - 만료시각이 지났으면 false
 * - 서명이 일치하지 않으면 false (timingSafeEqual로 타이밍 공격 방지)
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const [expiresAtMs, signatureHex] = token.split(".");
  if (!expiresAtMs || !signatureHex) return false;

  const expiresAt = Number(expiresAtMs);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSignatureHex = sign(expiresAtMs);
  const actual = Buffer.from(signatureHex, "hex");
  const expected = Buffer.from(expectedSignatureHex, "hex");

  // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 체크한다.
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

/**
 * 현재 요청의 세션 쿠키가 유효한지 서버에서 확인한다.
 *
 * ⚠️ layout이 `{children}`을 렌더링하지 않아도 Next.js는 매칭된 하위 page 세그먼트를
 * 같은 요청의 RSC 응답(flight payload)에 함께 스트리밍한다. 즉 layout에서만 인증을
 * 검사하고 page는 무조건 데이터를 fetch하면, 화면에는 보이지 않아도 응답 본문에
 * 민감한 데이터(공유토큰 등)가 그대로 실려 나간다. 따라서 데이터를 fetch하는 모든
 * Server Component(예: admin/page.tsx)는 이 함수로 자체적으로 인증을 재확인해야 한다.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
