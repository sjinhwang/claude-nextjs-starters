"use client";

import { useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { fetchAllInvoices } from "./actions";
import { logger } from "@/lib/logger";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

type InvoiceSummary = Omit<Invoice, "항목">;

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; variant: "secondary" | "success" | "destructive" }
> = {
  대기: { label: "대기", variant: "secondary" },
  승인: { label: "승인", variant: "success" },
  거절: { label: "거절", variant: "destructive" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

/** F004~F006: 견적서 목록 테이블 — 새로고침, 미리보기 기능 포함 */
export default function InvoiceTable({
  initialInvoices,
}: {
  initialInvoices: InvoiceSummary[];
}) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>(initialInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // F004: 견적서 목록 새로고침
  async function handleRefresh() {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await fetchAllInvoices();
      setInvoices(data);
    } catch (error) {
      // 새로고침 실패 시 목록 상단에 오류 안내
      logger.error("InvoiceTable", "견적서 목록 새로고침 실패", error);
      setLoadError("견적서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  // F005: 견적서 공개 조회 페이지 새 탭 미리보기
  function handlePreview(invoice: InvoiceSummary) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin;
    window.open(`${baseUrl}/invoices/${invoice.공유토큰}`, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            견적서 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500">총 {invoices.length}건</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} />
          새로고침
        </Button>
      </div>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 text-left">견적서 번호</th>
              <th className="px-4 py-3 text-left">클라이언트</th>
              <th className="px-4 py-3 text-left">발행일</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-right">PDF 다운로드</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-zinc-400"
                >
                  견적서가 없습니다.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const config = STATUS_CONFIG[invoice.상태];
                const canCopy =
                  invoice.상태 === "승인" && !!invoice.공유토큰;

                return (
                  <tr
                    key={invoice.id}
                    className="bg-white dark:bg-zinc-950 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      {invoice.견적서번호}
                    </td>
                    <td className="px-4 py-3">{invoice.클라이언트명}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDate(invoice.발행일)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canCopy}
                        onClick={() => canCopy && handlePreview(invoice)}
                      >
                        <Eye />
                        미리보기
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
