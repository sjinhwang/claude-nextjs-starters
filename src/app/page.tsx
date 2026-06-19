import Container from "@/components/layout/Container";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-900">
      <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Next.js Starter
        </h1>
        <p className="mb-8 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript 기반의 스타터
          템플릿입니다.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
            Next.js 16
          </span>
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
            React 19
          </span>
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
            Tailwind v4
          </span>
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
            TypeScript
          </span>
        </div>
      </Container>
    </div>
  );
}
