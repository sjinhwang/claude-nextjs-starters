import { fetchAllInvoices } from "../actions";
import { logger } from "@/lib/logger";
import { isAdminAuthenticated } from "@/lib/session";
import InvoiceTable from "../InvoiceTable";
import type { Invoice } from "@/types/invoice";

/**
 * 어드민 견적서 목록 페이지 (Server Component)
 *
 * ⚠️ `admin/layout.tsx`가 미인증 시 로그인 폼만 화면에 렌더링하더라도, Next.js는
 * 매칭된 이 page 세그먼트를 같은 요청의 RSC 응답에 함께 스트리밍한다. layout의
 * 인증 체크만 믿고 여기서 바로 데이터를 fetch하면, 화면엔 안 보여도 응답 본문에
 * 견적서 데이터(공유토큰 포함)가 그대로 실려 나가는 유출이 발생한다. 따라서
 * 이 컴포넌트도 반드시 자체적으로 세션을 재확인한 뒤에만 fetch해야 한다.
 */
export default async function AdminInvoicesPage() {
  if (!(await isAdminAuthenticated())) {
    return null;
  }

  let invoices: Omit<Invoice, "항목">[] = [];
  let loadError = "";

  try {
    invoices = await fetchAllInvoices();
  } catch (error) {
    logger.error("AdminInvoicesPage", "견적서 목록 조회 실패", error);
    loadError = "견적서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  }

  if (loadError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
    );
  }

  return <InvoiceTable initialInvoices={invoices} />;
}
