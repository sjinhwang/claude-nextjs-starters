import Link from "next/link";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-24">
      <Container className="flex flex-col items-center text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          견적서 관리 시스템
        </h1>
        <p className="mb-10 max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Notion을 기반으로 견적서를 생성·관리·공유하세요.
        </p>
        {/* MVP: /admin 라우트만 존재하므로 버튼 1개로 단순화합니다 */}
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/admin">견적서 관리하기</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
