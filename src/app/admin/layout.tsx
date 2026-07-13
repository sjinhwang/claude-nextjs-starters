import { FileText } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/session";
import AdminLoginForm from "./AdminLoginForm";
import LogoutButton from "./LogoutButton";
import AdminSidebar from "./AdminSidebar";
import Container from "@/components/layout/Container";

/**
 * 어드민 레이아웃 — 서버에서 세션 쿠키를 검증해 인증 게이트 역할을 한다.
 * 기존에는 클라이언트 state(phase)로 인증 화면/목록 화면을 토글했기 때문에
 * 새로고침 시 인증이 풀리는 문제가 있었다. 이제 서명된 세션 쿠키를 서버에서
 * 검증하므로 새로고침해도 로그인 상태가 유지된다.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await isAdminAuthenticated();

  // 미인증: 로그인 폼만 렌더링. 화면에는 보이지 않아도 하위 page 세그먼트는
  // 같은 요청의 RSC 응답에 함께 스트리밍되므로, 데이터 유출 방지는
  // page.tsx가 isAdminAuthenticated()로 자체 재확인하는 방식으로 보장한다.
  if (!isAuthenticated) {
    return (
      <section className="flex flex-1 items-center justify-center py-24">
        <Container className="max-w-sm">
          <AdminLoginForm />
        </Container>
      </section>
    );
  }

  // 인증됨: 어드민 전용 헤더 + 사이드바 + 콘텐츠로 구성된 앱 셸
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-zinc-100 p-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <FileText size={18} />
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            견적서 관리 시스템
          </span>
        </div>
        <LogoutButton />
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
