---
name: project-invoice-types
description: InvoiceHub 견적서 도메인 타입 정의 위치 및 구조 (2026-07-01 기준 실제 코드로 갱신)
metadata:
  type: project
---

`src/types/invoice.ts`에 견적서 도메인 타입이 정의되어 있습니다. (필드명은 한글 — 프로젝트 전역 컨벤션)

- `InvoiceStatus` — union type: `"대기" | "거절" | "승인"` (Notion Status 속성의 실제 옵션값)
  - 대기/거절: 공개 조회 404, 승인만 공개 조회 허용 (`invoices/[token]/page.tsx`에서 체크)
- `InvoiceItem` — 단일 견적 항목: `id, 항목명, 수량, 단가, 금액(formula)`
- `Invoice` — 파싱된 도메인 객체: `id, 견적서번호, 클라이언트명, 발행일, 유효기간, 상태, 총금액, 공유토큰, 항목`
- `NotionInvoiceProperties` / `NotionInvoiceItemProperties` — Notion API 원시 응답 properties 구조 (실제 API로 확인된 internal id 주석 포함)

**Why:** Notion API 응답(raw)과 앱 도메인 객체(clean)를 분리하여 타입 안전성 확보.

**How to apply:** Notion API 연동 시 raw properties 타입으로 받고, `parseInvoice`/`parseItem`(`src/lib/notion.ts`)로 정제 후 `Invoice`/`InvoiceItem`으로 변환합니다.

**정정된 사실 (이전 메모리 오류):** 품목은 Invoices DB의 `rich_text` JSON이 아니라 **별도 Items DB**에 저장되고, `Invoices` relation 속성(영문명)으로 연결됩니다. `getInvoiceItems`는 Items DB를 relation 필터(`contains: invoicePageId`)로 직접 조회하여, relation 배열(최대 25개 절단) 파싱을 우회합니다. 품목 100개 초과 시 페이지네이션 미지원(MVP 범위 외).

관련: [[notion-data-source-v5]], [[nextjs16-caching-and-server-actions]]
