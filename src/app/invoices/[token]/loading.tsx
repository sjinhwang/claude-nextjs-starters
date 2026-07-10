/**
 * 견적서 공개 조회 페이지 로딩 스켈레톤
 * Server Component — Suspense 경계용 플레이스홀더
 * A4 레이아웃 구조를 회색 블록으로 표현
 */
export default function InvoiceLoading() {
  return (
    <div className="py-8 px-4">
      {/* PDF 버튼 영역 플레이스홀더 */}
      <div className="mx-auto mb-4 flex max-w-[794px] justify-end">
        <div className="h-9 w-32 animate-pulse rounded-md bg-zinc-200" />
      </div>

      {/* A4 견적서 본문 스켈레톤 */}
      <div className="mx-auto max-w-[794px] bg-white shadow-lg">
        <div className="p-12">
          {/* 헤더 — 제목 + 견적서 번호 */}
          <div className="flex items-start justify-between border-b-2 border-zinc-200 pb-6">
            <div className="h-10 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="flex flex-col items-end gap-2">
              <div className="h-3.5 w-16 animate-pulse rounded bg-zinc-100" />
              <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>

          {/* 수신인 / 발행인 2열 그리드 */}
          <div className="mt-6 grid grid-cols-2 gap-8">
            {/* 수신인 */}
            <div className="space-y-2">
              <div className="h-3 w-10 animate-pulse rounded bg-zinc-100" />
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
            </div>
            {/* 발행인 */}
            <div className="space-y-2">
              <div className="h-3 w-10 animate-pulse rounded bg-zinc-100" />
              <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-56 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>

          {/* 날짜 정보 행 */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 px-4 py-3">
            <div className="flex gap-2">
              <div className="h-4 w-10 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-14 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>

          {/* 품목 테이블 스켈레톤 */}
          <div className="mt-8">
            {/* 테이블 헤더 */}
            <div className="flex gap-4 border-y border-zinc-200 py-3">
              <div className="h-3 flex-1 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
            </div>
            {/* 테이블 행 — 3개 예시 */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b border-zinc-100 py-3"
              >
                <div
                  className="h-4 flex-1 animate-pulse rounded bg-zinc-200"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
                <div
                  className="h-4 w-12 animate-pulse rounded bg-zinc-100"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
                <div
                  className="h-4 w-24 animate-pulse rounded bg-zinc-100"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
                <div
                  className="h-4 w-28 animate-pulse rounded bg-zinc-200"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              </div>
            ))}
          </div>

          {/* 합계 섹션 */}
          <div className="mt-6 border-t border-zinc-200 pt-4">
            <div className="ml-auto max-w-60 space-y-3">
              {/* 공급가액 */}
              <div className="flex justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
              {/* 부가세 */}
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
              {/* 합계 — 더 진한 색상으로 강조 */}
              <div className="flex justify-between border-t border-zinc-200 pt-2">
                <div className="h-5 w-10 animate-pulse rounded bg-zinc-300" />
                <div className="h-5 w-24 animate-pulse rounded bg-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
