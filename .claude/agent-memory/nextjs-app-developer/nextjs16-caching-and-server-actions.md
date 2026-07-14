---
name: nextjs16-caching-and-server-actions
description: Next.js 16 데이터 캐싱(use cache vs unstable_cache) 선택 근거와 "use server" 파일 export 제약 — InvoiceHub에서 실제로 부딪힌 이슈
metadata:
  type: project
---

## 데이터 레이어 캐싱: `use cache` 대신 `unstable_cache` 선택

`node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` 확인 결과, `"use cache"` 디렉티브는 `next.config.ts`에 `cacheComponents: true`를 켜야 동작하는 **Cache Components** 기능입니다. InvoiceHub의 `next.config.ts`는 이 옵션을 켜지 않은 상태이고, 앱 전체 렌더링 모델(전 라우트의 static/dynamic 경계)에 영향을 주는 큰 변경이라 MVP 범위를 벗어납니다.

반면 `unstable_cache`(`next/cache`)는 config 변경 없이 독립적으로 동작하며, `invoices/[token]/page.tsx`의 `export const dynamic = "force-dynamic"`(Full Route Cache 비활성화)과 **레이어가 다르므로 충돌하지 않습니다** — 라우트는 매 요청 렌더링되지만 그 안에서 부르는 `unstable_cache`로 감싼 Notion fetch는 독립적으로 시간 기반 캐싱됩니다.

**Why:** "force-dynamic 유지 + Notion 호출만 60초 캐싱"이라는 요구사항을 config 변경 없이 최소 침습적으로 만족시키기 위함.

**How to apply:** 이후에도 새로운 데이터 소스 캐싱이 필요하면, `cacheComponents`를 켤 계획이 없는 한 `unstable_cache(fn, keyParts, { revalidate, tags })` 패턴을 우선 고려할 것. `src/lib/notion.ts`에 실제 적용 예시 있음 (`getInvoiceByToken`, `getInvoiceItems`, `getAllInvoices`를 각각 감쌈).

## `"use server"` 파일은 async 함수만 export 가능

React Server Functions 규칙상 `"use server"` 파일(`src/app/admin/actions.ts` 등)은 **async 함수만 export**할 수 있습니다. 클래스나 상수(`export class`, `export const X = "..."`)를 함께 export하면 빌드 실패 위험이 있습니다.

**Why:** 클라이언트-서버 경계를 넘는 모듈은 함수 참조만 직렬화 가능한 형태로 변환되기 때문.

**How to apply:** Server Action과 클라이언트가 공유해야 하는 상수/타입(예: rate-limit 에러 메시지 식별자)은 `"use server"` 파일이 아닌 별도 모듈(예: `src/lib/rate-limit.ts`)에 정의하고 양쪽에서 import할 것.

관련: [[project-invoice-types]]
