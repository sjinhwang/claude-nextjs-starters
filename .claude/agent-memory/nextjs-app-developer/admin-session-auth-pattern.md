---
name: admin-session-auth-pattern
description: InvoiceHub 어드민 인증을 서버 검증 세션 쿠키 + admin/layout.tsx 인증 게이트로 구현한 확정 패턴 (Phase 5, T501~T505)
metadata:
  type: project
---

## 구조

- `src/lib/session.ts` — HMAC-SHA256(Node 내장 `node:crypto`, `createHmac`/`timingSafeEqual`) 서명 기반 stateless 세션 토큰. 쿠키 값 형식 `${expiresAtMs}.${signatureHex}`. 서명 비밀키는 새 환경변수 없이 `ADMIN_PASSWORD`를 재사용 — 비밀번호 변경 시 기존 세션이 자동 무효화되는 의도된 부수 효과.
- `src/app/admin/layout.tsx` (async Server Component) — `(await cookies()).get(SESSION_COOKIE_NAME)?.value`를 `verifySessionToken`으로 검증해 인증 게이트 역할. 미인증 시 `AdminLoginForm`, 인증 시 `LogoutButton` + `children`(page.tsx)을 렌더링. `<section className="py-12"><Container>` 래퍼는 layout이 소유하고, `page.tsx`/`InvoiceTable.tsx`는 안쪽 콘텐츠만 렌더링.
- `src/app/admin/actions.ts`(`"use server"`) — `login(password)`은 throw 대신 `{ success, error? }` 반환(`RATE_LIMIT_ERROR_MESSAGE` | `"INVALID_PASSWORD"`), 성공 시 `cookies().set(..., { path: "/admin", httpOnly, sameSite: "lax", secure: NODE_ENV==="production", maxAge: SESSION_MAX_AGE_SECONDS })`. `logout()`은 `cookies().delete({ name, path: "/admin" })` — set과 **동일 path 필수**(next/headers cookies delete 제약, 다르면 무시됨).
- `src/app/admin/AdminLoginForm.tsx`(`"use client"`) — 순수 인증 폼. 로그인 성공 후 `router.refresh()`(next/navigation)로 layout(Server Component)을 재실행시켜 인증 게이트를 통과. Notion 데이터 fetch는 하지 않음(관심사 분리).
- `src/app/admin/LogoutButton.tsx`(`"use client"`) — `logout()` 호출 후 `router.refresh()`.
- `src/app/admin/page.tsx`(async Server Component) — `fetchAllInvoices()`를 직접 await하고 `InvoiceTable`에 `initialInvoices` prop으로 전달. 목록 헤더(제목/건수/새로고침 버튼)와 테이블 JSX는 전부 `InvoiceTable.tsx`(`"use client"`)가 소유.

## 검증된 타입 사실

`node_modules/next/dist/compiled/@edge-runtime/cookies/index.d.ts`의 `ResponseCookies.delete` 시그니처는 `[key: string] | [options: Omit<ResponseCookie, 'value'|'expires'>]` — 즉 `{ name, path, domain, ... }` 객체 형태 삭제가 **공식 지원**된다(공개 문서 `cookies.md`에는 `delete('name')` 형태만 예시로 나와 있어 헷갈리기 쉬움). path가 다르면 브라우저가 다른 쿠키로 취급해 삭제가 무시되므로, set 시 지정한 path와 delete 시 path를 반드시 일치시켜야 한다.

관련: [[nextjs16-caching-and-server-actions]] (`"use server"` 파일 export 제약과 연결됨 — `SESSION_COOKIE_NAME`/`SESSION_MAX_AGE_SECONDS` 같은 상수는 `session.ts`에 두고 actions.ts와 layout.tsx 양쪽에서 import)
