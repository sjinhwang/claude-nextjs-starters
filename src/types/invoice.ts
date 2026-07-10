/**
 * InvoiceHub 도메인 타입 정의
 * 실제 Notion API 응답 구조 기반 (2026-06-30 API 직접 확인)
 *
 * ⚠️ 핵심: Notion API page.properties의 키는 obfuscated ID가 아닌 속성 display name
 *   - Invoices: "견적서번호", "클라이언트명", "발행일", "유효기간", "상태", "총금액", "항목", "공유토큰"
 *   - Items: "항목명", "수량", "단가", "금액", "Invoices" (영문)
 */

// ─── 견적서 상태 ──────────────────────────────────────────────────────────────

/**
 * 견적서 상태 (Notion Status 타입 실제 옵션값)
 * - 대기: 초안 → 공개 조회 불가 (404)
 * - 거절: 거절됨 → 공개 조회 불가 (404)
 * - 승인: 발행 완료 → 공개 조회 허용
 */
export type InvoiceStatus = "대기" | "거절" | "승인";

// ─── 도메인 객체 ──────────────────────────────────────────────────────────────

/** Items DB 단일 행 파싱 결과 */
export interface InvoiceItem {
  id: string;
  항목명: string;
  수량: number | null;
  단가: number | null;
  /** formula: 수량 × 단가 (Notion 자동 계산) */
  금액: number | null;
}

/** 견적서 도메인 객체 (Notion properties 파싱 후 정제된 형태) */
export interface Invoice {
  id: string;
  견적서번호: string;
  클라이언트명: string;
  발행일: string | null;
  유효기간: string | null;
  상태: InvoiceStatus;
  총금액: number | null;
  공유토큰: string;
  항목: InvoiceItem[];
}

// ─── Notion API 원시 응답 타입 ────────────────────────────────────────────────

/**
 * Invoices DB page.properties 타입
 *
 * 실제 API 확인 결과 (property name → internal id):
 *   견적서번호 → title
 *   클라이언트명 → Pdyc
 *   발행일     → bF{c
 *   유효기간   → MBq]
 *   상태       → puDX
 *   총금액     → mm;K
 *   항목       → nTGV
 *   공유토큰   → oRk]
 */
export interface NotionInvoiceProperties {
  견적서번호: {
    id: string;
    type: "title";
    title: Array<{ plain_text: string }>;
  };
  클라이언트명: {
    id: string;
    type: "rich_text";
    rich_text: Array<{ plain_text: string }>;
  };
  발행일: {
    id: string;
    type: "date";
    date: { start: string; end: string | null; time_zone: string | null } | null;
  };
  유효기간: {
    id: string;
    type: "date";
    date: { start: string; end: string | null; time_zone: string | null } | null;
  };
  상태: {
    id: string;
    type: "status";
    status: { id: string; name: InvoiceStatus; color: string } | null;
  };
  총금액: {
    id: string;
    type: "number";
    number: number | null;
  };
  항목: {
    id: string;
    type: "relation";
    relation: Array<{ id: string }>;
    has_more: boolean;
  };
  공유토큰: {
    id: string;
    type: "rich_text";
    rich_text: Array<{ plain_text: string }>;
  };
}

/**
 * Items DB page.properties 타입
 *
 * 실제 API 확인 결과 (property name → internal id):
 *   항목명   → title
 *   수량     → P<JA
 *   단가     → Xu@T
 *   금액     → JoGO  (formula)
 *   Invoices → qkUu  (영문 속성명)
 */
export interface NotionInvoiceItemProperties {
  항목명: {
    id: string;
    type: "title";
    title: Array<{ plain_text: string }>;
  };
  수량: {
    id: string;
    type: "number";
    number: number | null;
  };
  단가: {
    id: string;
    type: "number";
    number: number | null;
  };
  금액: {
    id: string;
    type: "formula";
    formula: { type: "number"; number: number | null };
  };
  /** Relation to Invoices DB (영문 속성명) */
  Invoices: {
    id: string;
    type: "relation";
    relation: Array<{ id: string }>;
    has_more: boolean;
  };
}
