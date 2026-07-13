import Link from "next/link";
import { FileQuestion } from "lucide-react";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

/** 커스텀 404 페이지 — Next.js 기본 404는 테마를 무시하므로 다크모드 대응해 대체 */
export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-24">
      <Container className="flex flex-col items-center text-center">
        <FileQuestion className="mb-4 size-12 text-zinc-300 dark:text-zinc-700" />
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-8 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          요청하신 페이지가 존재하지 않거나 더 이상 제공되지 않습니다.
        </p>
        <Button asChild>
          <Link href="/">홈으로 이동</Link>
        </Button>
      </Container>
    </section>
  );
}
