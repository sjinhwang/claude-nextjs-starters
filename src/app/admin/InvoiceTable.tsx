"use client";

import { useMemo, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { fetchAllInvoices } from "./actions";
import InvoiceFilterBar from "./InvoiceFilterBar";
import { logger } from "@/lib/logger";
import { buildInvoiceShareUrl } from "@/lib/invoice-url";
import { cn } from "@/lib/utils";
import {
  PAGE_SIZE,
  compareInvoices,
  highlightSegments,
  matchesDateRange,
  matchesSearch,
  matchesStatusFilter,
  normalizeText,
  type SortDirection,
  type SortKey,
} from "./invoice-table-utils";
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

/** 정렬 가능한 컬럼 헤더 — 실제 <button>을 감싸고 aria-sort는 <th>가 갖는다 (T905) */
function SortableHeader({
  label,
  columnKey,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === columnKey;
  const ariaSort = isActive
    ? sortDirection === "asc"
      ? "ascending"
      : "descending"
    : "none";
  const Icon = isActive ? (sortDirection === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className="px-4 py-3 text-left" aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className="inline-flex items-center gap-1 uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        {label}
        <Icon className={cn("size-3.5", !isActive && "text-zinc-400 dark:text-zinc-600")} />
      </button>
    </th>
  );
}

/** 검색어 매치 구간을 <mark>로 감싸 하이라이팅된 텍스트를 렌더링한다 (T907) */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = highlightSegments(text, query);
  return (
    <>
      {segments.map((segment, index) =>
        segment.matched ? (
          <mark
            key={index}
            className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-500/40"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </>
  );
}

/** F004~F006: 견적서 목록 테이블 — 검색/필터/정렬/페이지네이션 포함 */
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

  // ─── T901: 검색/필터/정렬/페이지 상태 ────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounceValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<Set<InvoiceStatus>>(() => new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("발행일");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

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

  // ─── T902~T905: 검색/필터/정렬 핸들러 — 값 변경과 함께 1페이지로 리셋(T906) ──
  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleToggleStatus(status: InvoiceStatus) {
    setStatusFilter((prev) => {
      // 참조 동일성이 깨져야 useMemo가 재계산되므로 항상 새 Set 인스턴스를 생성한다.
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
    setPage(1);
  }

  function handleDateFromChange(value: string) {
    setDateFrom(value);
    setPage(1);
  }

  function handleDateToChange(value: string) {
    setDateTo(value);
    setPage(1);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  /** 검색어/상태/날짜/페이지를 초기화한다(정렬은 유지). 빈 상태 안내와 필터 바 양쪽에서 재사용(T908). */
  function handleResetFilters() {
    setSearchInput("");
    setStatusFilter(new Set());
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  // ─── 파생 파이프라인: 필터 → 정렬 → 페이지네이션 (원본 invoices는 변형하지 않음) ──
  const normalizedQuery = normalizeText(debouncedSearch);

  const filtered = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          matchesSearch(invoice, normalizedQuery) &&
          matchesStatusFilter(invoice, statusFilter) &&
          matchesDateRange(invoice, dateFrom, dateTo)
      ),
    [invoices, normalizedQuery, statusFilter, dateFrom, dateTo]
  );

  const sorted = useMemo(
    () => [...filtered].sort(compareInvoices(sortKey, sortDirection)),
    [filtered, sortKey, sortDirection]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const paginated = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const hasNoInvoicesAtAll = invoices.length === 0;
  const hasNoFilteredResults = invoices.length > 0 && sorted.length === 0;

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

      {!hasNoInvoicesAtAll && (
        <InvoiceFilterBar
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          statusFilter={statusFilter}
          onToggleStatus={handleToggleStatus}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onReset={handleResetFilters}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <SortableHeader
                label="견적서 번호"
                columnKey="견적서번호"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3 text-left">클라이언트</th>
              <SortableHeader
                label="발행일"
                columnKey="발행일"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="상태"
                columnKey="상태"
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="px-4 py-3 text-right">링크</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {hasNoInvoicesAtAll ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-zinc-400 dark:text-zinc-500"
                >
                  견적서가 없습니다.
                </td>
              </tr>
            ) : hasNoFilteredResults ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-zinc-400 dark:text-zinc-500">
                    조건에 맞는 견적서가 없습니다. 검색어나 필터를 확인해주세요.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleResetFilters}
                  >
                    필터 초기화
                  </Button>
                </td>
              </tr>
            ) : (
              paginated.map((invoice) => {
                const config = STATUS_CONFIG[invoice.상태];
                const canCopy =
                  invoice.상태 === "승인" && !!invoice.공유토큰;
                const shareUrl = canCopy
                  ? buildInvoiceShareUrl(invoice.공유토큰)
                  : null;

                return (
                  <tr
                    key={invoice.id}
                    className="bg-white dark:bg-zinc-950 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      <HighlightedText text={invoice.견적서번호} query={debouncedSearch} />
                    </td>
                    <td className="px-4 py-3">
                      <HighlightedText text={invoice.클라이언트명} query={debouncedSearch} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(invoice.발행일)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {shareUrl ? (
                          <span
                            className="max-w-[220px] truncate font-mono text-xs text-zinc-500 dark:text-zinc-400"
                            title={shareUrl}
                          >
                            {shareUrl}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            발행 전
                          </span>
                        )}
                        <div className="flex shrink-0 items-center gap-2">
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
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!hasNoInvoicesAtAll && (
        <div className="mt-4 flex items-center justify-between">
          <p aria-live="polite" className="text-sm text-zinc-500 dark:text-zinc-400">
            총 {sorted.length}건 · {clampedPage}/{totalPages} 페이지
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage === 1}
              onClick={() => setPage(clampedPage - 1)}
            >
              <ChevronLeft />
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage === totalPages}
              onClick={() => setPage(clampedPage + 1)}
            >
              다음
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
