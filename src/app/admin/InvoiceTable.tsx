"use client";

import { useRef, useState } from "react";
import { Check, Copy, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { fetchAllInvoices } from "./actions";
import { logger } from "@/lib/logger";
import { buildInvoiceShareUrl } from "@/lib/invoice-url";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

type InvoiceSummary = Omit<Invoice, "항목">;

/** 클립보드 복사 결과 — 어느 행(invoice.id)에 어떤 피드백을 보여줄지 */
type CopyFeedback = { id: string; status: "success" | "error" };

/**
 * 클립보드 복사 시도
 * 1차: navigator.clipboard.writeText (보안 컨텍스트/최신 브라우저)
 * 2차 폴백: 임시 textarea + document.execCommand('copy') (비-HTTPS/구형 브라우저)
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 실패 시 아래 폴백으로 진행
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // 화면에 보이지 않도록 배치
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

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

  // T604: 복사 성공/실패 피드백 — 어느 행인지(id)와 상태를 함께 저장
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    window.open(buildInvoiceShareUrl(invoice.공유토큰), "_blank", "noopener,noreferrer");
  }

  // F005, F008: 공유 URL 클립보드 복사
  async function handleCopy(invoice: InvoiceSummary) {
    // 빠르게 여러 번 클릭해도 이전 타이머가 늦게 원복시키지 않도록 정리
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    const url = buildInvoiceShareUrl(invoice.공유토큰);
    const success = await copyToClipboard(url);
    setCopyFeedback({ id: invoice.id, status: success ? "success" : "error" });
    copyTimeoutRef.current = setTimeout(() => setCopyFeedback(null), 1500);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            견적서 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">총 {invoices.length}건</p>
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
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 text-left">견적서 번호</th>
              <th className="px-4 py-3 text-left">클라이언트</th>
              <th className="px-4 py-3 text-left">발행일</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-zinc-400 dark:text-zinc-500"
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
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(invoice.발행일)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canCopy}
                          onClick={() => canCopy && handlePreview(invoice)}
                        >
                          <Eye />
                          미리보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canCopy}
                          onClick={() => canCopy && handleCopy(invoice)}
                        >
                          {copyFeedback?.id === invoice.id &&
                          copyFeedback.status === "error" ? (
                            <span className="text-red-600 dark:text-red-400">
                              복사 실패
                            </span>
                          ) : copyFeedback?.id === invoice.id &&
                            copyFeedback.status === "success" ? (
                            <>
                              <Check />
                              복사됨
                            </>
                          ) : (
                            <>
                              <Copy />
                              복사
                            </>
                          )}
                        </Button>
                      </div>
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
