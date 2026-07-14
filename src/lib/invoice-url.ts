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

/**
 * 견적서 공유 이메일 mailto 링크 생성 (F012, T1101)
 * 수신자 이메일 필드가 Notion 스키마에 없어 `to` 없이 제목/본문만 프리필한다.
 */
export function buildInvoiceMailtoUrl(
  invoiceNumber: string,
  clientName: string,
  shareUrl: string,
): string {
  const subject = encodeURIComponent(`견적서 ${invoiceNumber} 공유`);
  const body = encodeURIComponent(
    `${clientName}님, 아래 링크에서 견적서를 확인해주세요.\n\n${shareUrl}`,
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * 견적서 공유 텔레그램 공유 URL 생성 (F012, T1102)
 */
export function buildInvoiceTelegramShareUrl(shareUrl: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
}
