import type { Metadata } from "next";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "문서",
};

export default function DocsPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-900">
      <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          문서
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          준비 중입니다.
        </p>
      </Container>
    </div>
  );
}
