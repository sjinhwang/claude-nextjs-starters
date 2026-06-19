import Link from "next/link";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const techStack = [
  "Next.js 16",
  "React 19",
  "Tailwind v4",
  "TypeScript",
  "shadcn/ui",
];

const features = [
  {
    icon: "⚡",
    title: "Next.js 16 App Router",
    description: "파일 기반 라우팅과 서버 컴포넌트로 빠르고 유연한 앱 구조를 구성합니다.",
  },
  {
    icon: "⚛️",
    title: "React 19",
    description: "최신 훅과 동시성 기능을 활용해 더 나은 사용자 경험을 제공합니다.",
  },
  {
    icon: "🎨",
    title: "Tailwind CSS v4",
    description: "유틸리티 퍼스트 스타일링으로 빠르고 일관된 디자인을 구현합니다.",
  },
  {
    icon: "🔷",
    title: "TypeScript",
    description: "타입 안전성으로 개발 생산성과 코드 품질을 높입니다.",
  },
  {
    icon: "🧩",
    title: "shadcn/ui",
    description: "접근성을 갖춘 재사용 가능한 UI 컴포넌트를 바로 활용할 수 있습니다.",
  },
  {
    icon: "🌙",
    title: "다크 모드",
    description: "시스템·라이트·다크 세 가지 테마를 지원하며 localStorage에 저장됩니다.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-zinc-50 py-24 text-center dark:bg-zinc-900">
        <Container className="flex flex-col items-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Next.js Starter
          </h1>
          <p className="mb-8 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript + shadcn/ui
            기반의 스타터 템플릿입니다.
          </p>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {techStack.map((name) => (
              <Badge key={name} variant="secondary" className="px-3 py-1 text-sm">
                {name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/docs">시작하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/sjinhwang/claude-nextjs-starters" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="bg-white py-20 dark:bg-zinc-950">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              주요 기능
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              프로덕션에 바로 사용할 수 있는 기술 스택이 사전 구성되어 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="mb-2 text-2xl">{icon}</div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>{description}</CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900 py-20 text-center dark:bg-zinc-950">
        <Container>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
            지금 시작하세요
          </h2>
          <p className="mb-8 text-zinc-400">
            이 스타터 템플릿으로 빠르게 프로젝트를 시작하세요.
          </p>
          <Button asChild size="lg">
            <a href="https://github.com/sjinhwang/claude-nextjs-starters" target="_blank" rel="noopener noreferrer">
              GitHub에서 보기
            </a>
          </Button>
        </Container>
      </section>
    </>
  );
}
