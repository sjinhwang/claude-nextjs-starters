import Link from "next/link";
import { FileText, Users, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

/**
 * 어드민 대시보드 랜딩 페이지 (Server Component)
 * 정적 안내 콘텐츠만 렌더링하므로 별도 인증 재확인 없음(민감 데이터 fetch 없음).
 * "클라이언트 관리"·"최근 활동"은 PRD 범위 밖 기능이라 클릭 불가한 시각적
 * 플레이스홀더로만 표시한다.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          관리자 대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          견적서 관리 시스템에 오신 것을 환영합니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/invoices">
          <Card className="h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>견적서 관리</CardTitle>
              <FileText className="size-5 text-zinc-400 dark:text-zinc-500" />
            </CardHeader>
            <CardContent>발행한 모든 견적서를 확인하고 관리할 수 있습니다.</CardContent>
          </Card>
        </Link>

        <Card className="h-full cursor-not-allowed opacity-60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>클라이언트 관리</CardTitle>
            <Users className="size-5 text-zinc-400 dark:text-zinc-500" />
          </CardHeader>
          <CardContent>클라이언트 정보를 확인하고 관리할 수 있습니다.</CardContent>
        </Card>

        <Card className="h-full cursor-not-allowed opacity-60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 활동</CardTitle>
            <Clock className="size-5 text-zinc-400 dark:text-zinc-500" />
          </CardHeader>
          <CardContent>최근 견적서 발행 및 승인 현황을 확인할 수 있습니다.</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시작하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>
            왼쪽 사이드바에서 <strong className="font-medium text-zinc-900 dark:text-zinc-50">견적서 목록</strong>을 클릭하여 모든 견적서를 확인하세요.
          </p>
          <p>견적서를 검색하고 필터링하여 원하는 정보를 빠르게 찾을 수 있습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
