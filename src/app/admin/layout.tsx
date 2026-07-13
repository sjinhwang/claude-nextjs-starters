import { isAdminAuthenticated } from "@/lib/session";
import AdminLoginForm from "./AdminLoginForm";
import AdminShell from "./AdminShell";
import Container from "@/components/layout/Container";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * 어드민 레이아웃 — 서버에서 세션 쿠키를 검증해 인증 게이트 역할을 한다.
 * 기존에는 클라이언트 state(phase)로 인증 화면/목록 화면을 토글했기 때문에
 * 새로고침 시 인증이 풀리는 문제가 있었다. 이제 서명된 세션 쿠키를 서버에서
 * 검증하므로 새로고침해도 로그인 상태가 유지된다.
 *
 * 인증된 화면의 헤더/사이드바(모바일 드로어 포함)는 클라이언트 상태가
 * 필요해 `AdminShell`(Client Component)에 위임한다.
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
      <section className="relative flex flex-1 items-center justify-center py-24">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Container className="max-w-sm">
          <AdminLoginForm />
        </Container>
      </section>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
