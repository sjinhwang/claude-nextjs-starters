/**
 * 견적서 공유 URL 생성 유틸
 * F005, F008: 발행 상태 견적서의 공개 조회 페이지 URL을 생성한다.
 *
 * ⚠️ `window`를 참조하므로 Client Component에서만 호출할 것.
 */
export function buildInvoiceShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
  return `${baseUrl}/invoices/${token}`;
}
