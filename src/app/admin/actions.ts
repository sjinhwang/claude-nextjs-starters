"use server";

import { cookies, headers } from "next/headers";
import { getAllInvoices } from "@/lib/notion";
import { RATE_LIMIT_ERROR_MESSAGE } from "@/lib/rate-limit";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import type { Invoice } from "@/types/invoice";

// ─── Rate Limiting (F006 브루트포스 비밀번호 대입 방지) ──────────────────────────
// IP 기준 분당 최대 시도 횟수. 인메모리 Map 저장소이므로 서버리스 환경에서는
// 인스턴스별로 분리되는 한계가 있으나, MVP 범위에서는 충분한 방어 수준으로 간주한다.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Server Action에서 요청자의 IP를 얻는다.
 * Next.js 16 Server Action에는 별도의 request 객체가 전달되지 않으므로
 * `headers()`(next/headers)로 들어오는 요청 헤더를 직접 조회한다.
 * 리버스 프록시/플랫폼(Vercel 등)이 설정하는 x-forwarded-for를 우선 사용한다.
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headersList.get("x-real-ip") ?? "unknown";
}

/**
 * IP 기준 분당 요청 횟수를 검사하고 카운트를 증가시킨다.
 * 제한 초과 시 false를 반환한다.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * 어드민 비밀번호 로그인 처리.
 * throw 대신 결과 객체를 반환하여 클라이언트(AdminLoginForm)의 분기 처리를 단순화한다.
 */
export async function login(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIp();
  if (!checkRateLimit(ip)) {
    return { success: false, error: RATE_LIMIT_ERROR_MESSAGE };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "INVALID_PASSWORD" };
  }

  (await cookies()).set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { success: true };
}

/** 어드민 로그아웃 — 세션 쿠키를 제거한다. */
export async function logout(): Promise<void> {
  // set과 동일한 path를 지정해야 삭제가 반영된다 (next/headers cookies delete 제약).
  (await cookies()).delete({ name: SESSION_COOKIE_NAME, path: "/admin" });
}

export async function fetchAllInvoices(): Promise<Omit<Invoice, "항목">[]> {
  return getAllInvoices();
}
