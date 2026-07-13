import type { Invoice, InvoiceStatus } from "@/types/invoice";

type InvoiceSummary = Omit<Invoice, "항목">;

/** 페이지당 표시 건수 (고정, 페이지 크기 선택 UI 없음) */
export const PAGE_SIZE = 10;

export type SortKey = "발행일" | "견적서번호" | "상태";
export type SortDirection = "asc" | "desc";

/** 상태값 정렬 우선순위 — 기존 STATUS_CONFIG 선언 순서(대기/승인/거절)를 재사용 */
export const STATUS_RANK: Record<InvoiceStatus, number> = {
  대기: 0,
  승인: 1,
  거절: 2,
};

/** 검색어 정규화 — 앞뒤 공백 제거, 소문자화, 연속 공백을 단일 공백으로 축소 */
export function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** 클라이언트명/견적서번호 중 하나라도 정규화된 검색어를 포함하면 매치 (빈 쿼리는 무조건 매치) */
export function matchesSearch(
  invoice: InvoiceSummary,
  normalizedQuery: string
): boolean {
  if (normalizedQuery === "") return true;
  const client = normalizeText(invoice.클라이언트명);
  const number = normalizeText(invoice.견적서번호);
  return client.includes(normalizedQuery) || number.includes(normalizedQuery);
}

/** 상태 필터 — 선택된 상태가 없으면(빈 Set) 전체 표시 */
export function matchesStatusFilter(
  invoice: InvoiceSummary,
  statusFilter: ReadonlySet<InvoiceStatus>
): boolean {
  return statusFilter.size === 0 || statusFilter.has(invoice.상태);
}

/**
 * 발행일 범위 필터.
 * - from/to 둘 다 빈 값이면 무조건 매치(발행일이 null이어도 통과)
 * - 발행일이 null인데 from/to 중 하나라도 설정되어 있으면 제외
 * - 그 외에는 양쪽 경계 포함 비교
 */
export function matchesDateRange(
  invoice: InvoiceSummary,
  dateFrom: string,
  dateTo: string
): boolean {
  if (dateFrom === "" && dateTo === "") return true;
  if (invoice.발행일 === null) return false;
  if (dateFrom !== "" && invoice.발행일 < dateFrom) return false;
  if (dateTo !== "" && invoice.발행일 > dateTo) return false;
  return true;
}

/** 정렬 비교자 팩토리 — 발행일(null은 항상 끝) / 견적서번호(ko 로케일) / 상태(STATUS_RANK) */
export function compareInvoices(
  sortKey: SortKey,
  sortDirection: SortDirection
): (a: InvoiceSummary, b: InvoiceSummary) => number {
  return (a, b) => {
    if (sortKey === "발행일") {
      // 발행일이 null인 항목은 정렬 방향과 무관하게 항상 맨 뒤로 보낸다.
      if (a.발행일 === null && b.발행일 === null) return 0;
      if (a.발행일 === null) return 1;
      if (b.발행일 === null) return -1;
      const cmp = a.발행일 < b.발행일 ? -1 : a.발행일 > b.발행일 ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    }

    if (sortKey === "견적서번호") {
      const cmp = a.견적서번호.localeCompare(b.견적서번호, "ko");
      return sortDirection === "asc" ? cmp : -cmp;
    }

    // sortKey === "상태"
    const cmp = STATUS_RANK[a.상태] - STATUS_RANK[b.상태];
    return sortDirection === "asc" ? cmp : -cmp;
  };
}

export interface HighlightSegment {
  text: string;
  matched: boolean;
}

/**
 * 텍스트를 검색어 매치 구간으로 분할한다.
 * 빈 쿼리면 매치 없는 단일 세그먼트를 반환한다. 대소문자 무시, 원본(공백 미정규화) 텍스트 기준.
 */
export function highlightSegments(
  text: string,
  rawQuery: string
): HighlightSegment[] {
  const trimmed = rawQuery.trim();
  if (trimmed === "") {
    return [{ text, matched: false }];
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  // split의 홀수 인덱스가 캡처된 매치 구간이다. 먼저 원본 인덱스 기준으로
  // matched 여부를 계산한 뒤, 빈 문자열 세그먼트만 걸러낸다(인덱스 밀림 방지).
  return parts
    .map((part, index) => ({ text: part, matched: index % 2 === 1 }))
    .filter((segment) => segment.text !== "");
}
