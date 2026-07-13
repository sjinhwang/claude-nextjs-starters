"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import type { InvoiceStatus } from "@/types/invoice";

/** 상태 토글 칩 표시 순서 (대기 → 승인 → 거절) */
const STATUS_ORDER: InvoiceStatus[] = ["대기", "승인", "거절"];

/**
 * 검색/상태 필터/날짜 범위 필터를 담는 controlled 프레젠테이션 컴포넌트.
 * 상태는 부모(InvoiceTable)가 소유하며, 이 컴포넌트는 props로만 값과 핸들러를 받는다.
 */
export default function InvoiceFilterBar({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onToggleStatus,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  statusFilter: ReadonlySet<InvoiceStatus>;
  onToggleStatus: (status: InvoiceStatus) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        type="text"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        placeholder="클라이언트명 또는 견적서번호 검색"
        className="sm:w-64"
      />

      <div className="flex items-center gap-1.5">
        {STATUS_ORDER.map((status) => {
          const selected = statusFilter.has(status);
          return (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onToggleStatus(status)}
            >
              {status}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="발행일 시작"
          className="w-auto"
        />
        <span>~</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="발행일 종료"
          className="w-auto"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="sm:ml-auto"
        onClick={onReset}
      >
        초기화
      </Button>
    </div>
  );
}
