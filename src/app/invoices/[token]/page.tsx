import { notFound } from "next/navigation";
import { getInvoiceByToken } from "@/lib/notion";
import PrintButton from "@/components/invoices/PrintButton";

// PRD: Notion 최신 데이터 보장 — Full Route Cache 비활성화(no-store 상당)
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

function formatKRW(amount: number | null): string {
  if (amount === null) return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export default async function InvoicePage({ params }: PageProps) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);

  // F001: 승인 상태가 아니면 404 반환
  if (!invoice || invoice.상태 !== "승인") {
    notFound();
  }

  const supplyAmount = invoice.항목.reduce((sum, item) => sum + (item.금액 ?? 0), 0);
  const vat = Math.floor(supplyAmount * 0.1);
  const total = supplyAmount + vat;

  const issuerName = process.env.NEXT_PUBLIC_ISSUER_NAME ?? "발행인 회사명";
  const issuerContact = process.env.NEXT_PUBLIC_ISSUER_CONTACT ?? "연락처";
  const issuerAddress = process.env.NEXT_PUBLIC_ISSUER_ADDRESS ?? "주소";

  return (
    <div className="py-8 px-4 print:p-0">
      {/* F002: PDF 저장 버튼 — 인쇄 시 숨김 */}
      <div className="mx-auto mb-4 flex max-w-[794px] justify-end print:hidden">
        <PrintButton />
      </div>

      {/* A4 견적서 본문 */}
      <div className="mx-auto max-w-[794px] bg-white text-zinc-900 shadow-lg print:shadow-none">
        <div className="p-5 sm:p-12 print:p-8">
          {/* 헤더 */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-6">
            <h1 className="text-2xl font-bold tracking-wide sm:text-4xl sm:tracking-widest">견 적 서</h1>
            <div className="text-right text-sm">
              <p className="text-zinc-400">견적서 번호</p>
              <p className="text-base font-semibold">{invoice.견적서번호}</p>
            </div>
          </div>

          {/* 수신인 / 발행인 */}
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                수신인
              </p>
              <p className="text-lg font-semibold">{invoice.클라이언트명} 귀중</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                발행인
              </p>
              <p className="font-semibold">{issuerName}</p>
              <p className="text-sm text-zinc-500">{issuerContact}</p>
              <p className="text-sm text-zinc-500">{issuerAddress}</p>
            </div>
          </div>

          {/* 날짜 정보 */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm print:bg-transparent print:border print:border-zinc-200">
            <div className="flex gap-2">
              <span className="text-zinc-400">발행일</span>
              <span className="font-medium">{formatDate(invoice.발행일)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-400">유효기간</span>
              <span className="font-medium">{formatDate(invoice.유효기간)}</span>
            </div>
          </div>

          {/* 품목 테이블 */}
          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-y border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 pr-2 text-left sm:pr-4">품목</th>
                <th className="w-10 py-3 pr-2 text-right sm:w-16 sm:pr-4">수량</th>
                <th className="w-16 py-3 pr-2 text-right sm:w-32 sm:pr-4">단가</th>
                <th className="w-20 py-3 text-right sm:w-36">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoice.항목.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-2 font-medium sm:pr-4">{item.항목명}</td>
                  <td className="py-3 pr-2 text-right text-zinc-500 sm:pr-4">
                    {item.수량 ?? "-"}
                  </td>
                  <td className="py-3 pr-2 text-right text-zinc-500 sm:pr-4">
                    {formatKRW(item.단가)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatKRW(item.금액)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 합계 */}
          <div className="mt-6 border-t border-zinc-200 pt-4">
            <div className="ml-auto max-w-60 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">공급가액</span>
                <span className="font-medium">{formatKRW(supplyAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">부가세 (10%)</span>
                <span className="font-medium">{formatKRW(vat)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-900 pt-2 text-base font-bold">
                <span>합계</span>
                <span>{formatKRW(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
