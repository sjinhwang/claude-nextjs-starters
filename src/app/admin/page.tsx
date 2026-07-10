"use client";

import { useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Container from "@/components/layout/Container";
import { validateAdminPassword, fetchAllInvoices } from "./actions";
import { RATE_LIMIT_ERROR_MESSAGE } from "@/lib/rate-limit";
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

export default function AdminPage() {
  const [phase, setPhase] = useState<"auth" | "list">("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loadError, setLoadError] = useState("");

  // F006: 어드민 비밀번호 인증
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");
    try {
      const valid = await validateAdminPassword(password);
      if (!valid) {
        setAuthError("비밀번호가 올바르지 않습니다.");
        return;
      }
      const data = await fetchAllInvoices();
      setInvoices(data);
      setPhase("list");
    } catch (error) {
      // 로그인 시도 Rate Limit 초과 시 전용 안내 메시지 표시
      if (error instanceof Error && error.message === RATE_LIMIT_ERROR_MESSAGE) {
        setAuthError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      // Notion 조회 실패 시 인증 화면에 오류 안내 (isLoading 멈춤 방지)
      logger.error("AdminPage", "견적서 목록 조회 실패", error);
      setAuthError("견적서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  // F004: 견적서 목록 새로고침
  async function handleRefresh() {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await fetchAllInvoices();
      setInvoices(data);
    } catch (error) {
      // 새로고침 실패 시 목록 상단에 오류 안내
      logger.error("AdminPage", "견적서 목록 새로고침 실패", error);
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

  // 인증 전: 비밀번호 입력 화면
  if (phase === "auth") {
    return (
      <section className="flex flex-1 items-center justify-center py-24">
        <Container className="max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>어드민 로그인</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    비밀번호
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="어드민 비밀번호 입력"
                    required
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {authError}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "확인 중..." : "로그인"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Container>
      </section>
    );
  }

  // 인증 후: 견적서 목록
  return (
    <section className="py-12">
      <Container>
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
      </Container>
    </section>
  );
}
