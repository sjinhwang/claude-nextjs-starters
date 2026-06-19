"use client";

import { useState } from "react";
import {
  useToggle,
  useCounter,
  useDebounceValue,
  useMediaQuery,
} from "usehooks-ts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ExampleCard } from "@/components/examples/ExampleCard";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Container from "@/components/layout/Container";
import {
  Layers,
  FileText,
  LayoutDashboard,
  Code2,
  Database,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

const TABS = [
  { id: "components", label: "컴포넌트 쇼케이스", icon: Layers, stack: "shadcn/ui" },
  { id: "forms", label: "폼 예제", icon: FileText, stack: "React" },
  { id: "layouts", label: "레이아웃 예제", icon: LayoutDashboard, stack: "Tailwind CSS" },
  { id: "hooks", label: "usehooks-ts 예제", icon: Code2, stack: "usehooks-ts" },
  { id: "data-fetching", label: "데이터 패칭", icon: Database, stack: "Next.js" },
  { id: "optimization", label: "설정 및 최적화", icon: Settings, stack: "Next.js" },
] as const;

// ── 개별 상태가 필요한 예제 컴포넌트 ──────────────────────────────────

function ToggleDemo() {
  const [isOn, toggle] = useToggle(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <span
        className={`rounded-full px-4 py-1 text-sm font-medium ${
          isOn
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        {isOn ? "ON" : "OFF"}
      </span>
      <Button variant={isOn ? "default" : "outline"} onClick={toggle}>
        토글
      </Button>
    </div>
  );
}

function CounterDemo() {
  const { count, increment, decrement, reset } = useCounter(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {count}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={decrement}>−</Button>
        <Button variant="outline" size="sm" onClick={reset}>초기화</Button>
        <Button variant="outline" size="sm" onClick={increment}>+</Button>
      </div>
    </div>
  );
}

function DebounceDemo() {
  const [input, setInput] = useState("");
  const [debouncedValue] = useDebounceValue(input, 500);
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="space-y-1">
        <Label htmlFor="debounce-input">입력값</Label>
        <Input
          id="debounce-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="입력 후 500ms 지연..."
        />
      </div>
      <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">디바운스된 값 (500ms):</p>
        <p className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
          {debouncedValue || (
            <span className="italic text-zinc-400">비어있음</span>
          )}
        </p>
      </div>
    </div>
  );
}

function MediaQueryDemo() {
  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const breakpoints = [
    { label: "sm (640px+)", active: isSm },
    { label: "md (768px+)", active: isMd },
    { label: "lg (1024px+)", active: isLg },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {breakpoints.map(({ label, active }) => (
        <span
          key={label}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            active
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {active ? "✓" : "✕"} {label}
        </span>
      ))}
    </div>
  );
}

function DataFetchDemo() {
  const [result, setResult] = useState<{ message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hello");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleFetch} disabled={loading}>
        {loading ? "요청 중..." : "GET /api/hello"}
      </Button>
      {result && (
        <div className="rounded-lg bg-zinc-100 px-4 py-2 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {JSON.stringify(result)}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function FormValidationDemo() {
  const [values, setValues] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = { name: "", email: "" };
    if (!values.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!values.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!/\S+@\S+\.\S+/.test(values.email))
      e.email = "올바른 이메일 형식이 아닙니다.";
    setErrors(e);
    return !e.name && !e.email;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          ✓ 제출 완료: {values.name} ({values.email})
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            setValues({ name: "", email: "" });
            setErrors({ name: "", email: "" });
          }}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
      <div className="space-y-1">
        <Label htmlFor="val-name">이름 *</Label>
        <Input
          id="val-name"
          value={values.name}
          onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
          aria-invalid={!!errors.name}
          placeholder="홍길동"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="val-email">이메일 *</Label>
        <Input
          id="val-email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
          aria-invalid={!!errors.email}
          placeholder="hong@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        제출
      </Button>
    </form>
  );
}

function ThemeDemo() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeOptions = [
    { value: "light" as const, icon: <Sun size={14} />, label: "라이트" },
    { value: "system" as const, icon: <Monitor size={14} />, label: "시스템" },
    { value: "dark" as const, icon: <Moon size={14} />, label: "다크" },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        현재:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {theme}
        </span>
        {theme === "system" && (
          <span className="ml-1 text-zinc-400">→ {resolvedTheme}</span>
        )}
      </p>
      <div className="flex gap-2">
        {themeOptions.map(({ value, icon, label }) => (
          <Button
            key={value}
            variant={theme === value ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(value)}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function LocalStorageDemo() {
  const [name, setName] = useLocalStorage("demo-name", "");
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="space-y-1">
        <Label htmlFor="ls-input">새로고침 후에도 유지됩니다</Label>
        <Input
          id="ls-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요..."
        />
      </div>
      {name && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          저장된 값:{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {name}
          </span>
        </p>
      )}
    </div>
  );
}

// ── 탭 콘텐츠 ─────────────────────────────────────────────────────────

function ComponentsTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="Button Variants"
        description="CVA 기반의 6가지 버튼 스타일 변형"
        techStack="shadcn/ui"
        code={`import { Button } from "@/components/ui/Button";

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}
      >
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </ExampleCard>

      <ExampleCard
        title="Button Sizes"
        description="xs / sm / default / lg 4가지 크기 및 아이콘 버튼 지원"
        techStack="shadcn/ui"
        code={`<Button size="xs">XSmall</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </ExampleCard>

      <ExampleCard
        title="Badge Variants"
        description="default / secondary / success / destructive 4가지 배지 스타일"
        techStack="shadcn/ui"
        code={`import Badge from "@/components/ui/Badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="destructive">Destructive</Badge>`}
      >
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </ExampleCard>

      <ExampleCard
        title="Card 컴포넌트"
        description="Card, CardHeader, CardTitle, CardContent 컴포넌트 조합"
        techStack="shadcn/ui"
        code={`import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
  </CardHeader>
  <CardContent>
    카드 본문 내용이 여기에 표시됩니다.
  </CardContent>
</Card>`}
      >
        <Card className="w-full max-w-xs">
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
          </CardHeader>
          <CardContent>카드 본문 내용이 여기에 표시됩니다.</CardContent>
        </Card>
      </ExampleCard>
    </div>
  );
}

function FormsTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="Input + Label"
        description="shadcn/ui Input과 Label 기본 조합"
        techStack="shadcn/ui"
        code={`import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-1">
  <Label htmlFor="email">이메일</Label>
  <Input id="email" type="email" placeholder="이메일 주소 입력" />
</div>`}
      >
        <div className="w-full max-w-sm space-y-1">
          <Label htmlFor="demo-email">이메일</Label>
          <Input
            id="demo-email"
            type="email"
            placeholder="이메일 주소 입력"
          />
        </div>
      </ExampleCard>

      <ExampleCard
        title="Textarea"
        description="여러 줄 텍스트 입력 컴포넌트"
        techStack="shadcn/ui"
        code={`import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

<div className="space-y-1">
  <Label htmlFor="message">메시지</Label>
  <Textarea
    id="message"
    placeholder="내용을 입력하세요..."
    rows={4}
  />
</div>`}
      >
        <div className="w-full max-w-sm space-y-1">
          <Label htmlFor="demo-msg">메시지</Label>
          <Textarea
            id="demo-msg"
            placeholder="내용을 입력하세요..."
            rows={3}
          />
        </div>
      </ExampleCard>

      <ExampleCard
        title="폼 유효성 검사"
        description="useState 기반 클라이언트 사이드 유효성 검사 패턴"
        techStack="React"
        code={`"use client";
import { useState } from "react";

function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({ name: "", email: "" });

  const validate = () => {
    const e = { name: "", email: "" };
    if (!values.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!values.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!/\\S+@\\S+\\.\\S+/.test(values.email))
      e.email = "올바른 이메일 형식이 아닙니다.";
    setErrors(e);
    return !e.name && !e.email;
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); validate(); }}>
      <Label htmlFor="name">이름 *</Label>
      <Input
        id="name"
        value={values.name}
        aria-invalid={!!errors.name}
        onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
      />
      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      <Button type="submit">제출</Button>
    </form>
  );
}`}
      >
        <FormValidationDemo />
      </ExampleCard>
    </div>
  );
}

function LayoutsTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="Grid 레이아웃"
        description="Tailwind CSS grid로 반응형 열 구성 (모바일 1열 → 태블릿 2열 → 데스크탑 3열)"
        techStack="Tailwind CSS"
        code={`<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div className="rounded-lg bg-zinc-100 p-4">항목 1</div>
  <div className="rounded-lg bg-zinc-100 p-4">항목 2</div>
  <div className="rounded-lg bg-zinc-100 p-4">항목 3</div>
</div>`}
      >
        <div className="w-full space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {["항목 1", "항목 2", "항목 3"].map((n) => (
              <div
                key={n}
                className="rounded-lg bg-zinc-200 p-3 text-center text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
              >
                {n}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-400">
            창 크기에 따라 열 수가 변경됩니다
          </p>
        </div>
      </ExampleCard>

      <ExampleCard
        title="Flexbox 레이아웃"
        description="flex를 활용한 수평/수직 정렬 및 간격 조정"
        techStack="Tailwind CSS"
        code={`{/* 양쪽 정렬 */}
<div className="flex items-center justify-between">
  <span>왼쪽</span>
  <span>오른쪽</span>
</div>

{/* 중앙 + 간격 */}
<div className="flex items-center justify-center gap-4">
  <Button>버튼 1</Button>
  <Button variant="outline">버튼 2</Button>
</div>

{/* 줄바꿈 허용 */}
<div className="flex flex-wrap gap-2">
  {items.map((item) => <Badge key={item}>{item}</Badge>)}
</div>`}
      >
        <div className="w-full space-y-3">
          <div className="flex w-full items-center justify-between rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">왼쪽</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">오른쪽</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["Next.js", "React", "Tailwind", "TypeScript"].map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </div>
      </ExampleCard>

      <ExampleCard
        title="Container 컴포넌트"
        description="max-w-5xl 기준 중앙 정렬 + 좌우 패딩을 일관성 있게 적용"
        techStack="Tailwind CSS"
        code={`import Container from "@/components/layout/Container";

{/* 최대 너비 64rem, px-6 패딩, 중앙 정렬 */}
<Container>
  <p>콘텐츠가 여기에 들어갑니다.</p>
</Container>

{/* className으로 추가 스타일 */}
<Container className="py-12 text-center">
  <h1 className="text-4xl font-bold">섹션 제목</h1>
</Container>`}
      >
        <div className="w-full rounded-lg border-2 border-dashed border-zinc-300 p-3 dark:border-zinc-700">
          <div className="mx-auto max-w-xs border-2 border-dashed border-zinc-500 px-6 py-3 dark:border-zinc-400">
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Container (max-w-5xl, px-6)
            </p>
          </div>
        </div>
      </ExampleCard>

      <ExampleCard
        title="반응형 타이포그래피"
        description="화면 크기에 따라 달라지는 텍스트 크기"
        techStack="Tailwind CSS"
        code={`<h1 className="text-2xl font-bold sm:text-4xl lg:text-5xl">
  반응형 제목
</h1>
<p className="text-sm text-zinc-600 sm:text-base lg:text-lg">
  화면 크기에 따라 텍스트 크기가 달라집니다.
</p>`}
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl lg:text-4xl">
            반응형 제목
          </p>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm dark:text-zinc-500">
            창 크기를 변경해 보세요
          </p>
        </div>
      </ExampleCard>
    </div>
  );
}

function HooksTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="useToggle"
        description="불리언 값을 ON/OFF로 전환하는 훅"
        techStack="usehooks-ts"
        code={`import { useToggle } from "usehooks-ts";

function ToggleDemo() {
  const [isOn, toggle] = useToggle(false);

  return (
    <div>
      <span>{isOn ? "ON" : "OFF"}</span>
      <Button onClick={toggle}>토글</Button>
    </div>
  );
}`}
      >
        <ToggleDemo />
      </ExampleCard>

      <ExampleCard
        title="useCounter"
        description="카운터 값을 증가/감소/초기화하는 훅"
        techStack="usehooks-ts"
        code={`import { useCounter } from "usehooks-ts";

function CounterDemo() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div>
      <span>{count}</span>
      <Button onClick={decrement}>−</Button>
      <Button onClick={reset}>초기화</Button>
      <Button onClick={increment}>+</Button>
    </div>
  );
}`}
      >
        <CounterDemo />
      </ExampleCard>

      <ExampleCard
        title="useDebounce"
        description="값 변경을 지정한 시간(ms)만큼 지연시키는 훅 — 검색 입력에 유용"
        techStack="usehooks-ts"
        code={`import { useDebounceValue } from "usehooks-ts";
import { useState, useEffect } from "react";

function SearchDemo() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(query, 500);

  // debouncedQuery가 변경될 때만 API 호출
  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <Input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`}
      >
        <DebounceDemo />
      </ExampleCard>

      <ExampleCard
        title="useMediaQuery"
        description="CSS 미디어 쿼리를 구독하여 현재 뷰포트 크기를 반환하는 훅"
        techStack="usehooks-ts"
        code={`import { useMediaQuery } from "usehooks-ts";

function BreakpointDemo() {
  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  return (
    <div>
      <span>sm: {isSm ? "✓" : "✕"}</span>
      <span>md: {isMd ? "✓" : "✕"}</span>
      <span>lg: {isLg ? "✓" : "✕"}</span>
    </div>
  );
}`}
      >
        <MediaQueryDemo />
      </ExampleCard>
    </div>
  );
}

function DataFetchingTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="클라이언트 사이드 Fetch"
        description="클라이언트 컴포넌트에서 API 라우트를 호출하는 패턴"
        techStack="Next.js"
        code={`"use client";
import { useState } from "react";

function ApiDemo() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    const res = await fetch("/api/hello");
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <Button onClick={handleFetch} disabled={loading}>
        {loading ? "요청 중..." : "GET /api/hello"}
      </Button>
      {result && <pre>{JSON.stringify(result)}</pre>}
    </div>
  );
}`}
      >
        <DataFetchDemo />
      </ExampleCard>

      <ExampleCard
        title="서버 컴포넌트 Fetch"
        description="서버에서 직접 데이터를 가져오는 Next.js App Router 패턴"
        techStack="Next.js"
        code={`// app/posts/page.tsx — 서버 컴포넌트 (기본값)
async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    next: { revalidate: 60 }, // 60초마다 재검증 (ISR)
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // async/await 직접 사용 가능

  return (
    <ul>
      {posts.slice(0, 5).map((post: { id: number; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}`}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            서버 컴포넌트는 빌드 시 또는 요청 시 데이터를 가져옵니다.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            코드 보기 버튼을 눌러 패턴을 확인하세요.
          </p>
        </div>
      </ExampleCard>

      <ExampleCard
        title="API Route Handler"
        description="Next.js App Router의 Route Handler — GET/POST/PUT/DELETE 지원"
        techStack="Next.js"
        language="ts"
        code={`// src/app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "안녕하세요, Next.js!" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ received: body }, { status: 201 });
}

// 호출 예시
// fetch("/api/hello")
// fetch("/api/hello", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ name: "홍길동" }),
// })`}
      >
        <div className="text-center">
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            src/app/api/hello/route.ts
          </code>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            GET / POST 핸들러를 export합니다.
          </p>
        </div>
      </ExampleCard>
    </div>
  );
}

function OptimizationTab() {
  return (
    <div className="space-y-6">
      <ExampleCard
        title="다크모드 (useTheme)"
        description="ThemeProvider와 useTheme 훅으로 라이트/다크/시스템 테마 전환"
        techStack="Next.js"
        code={`"use client";
import { useTheme } from "@/components/theme/ThemeProvider";

function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // theme: "light" | "dark" | "system"
  // resolvedTheme: "light" | "dark" (실제 적용값)

  return (
    <div>
      <p>현재: {theme} (실제: {resolvedTheme})</p>
      <Button onClick={() => setTheme("light")}>라이트</Button>
      <Button onClick={() => setTheme("system")}>시스템</Button>
      <Button onClick={() => setTheme("dark")}>다크</Button>
    </div>
  );
}`}
      >
        <ThemeDemo />
      </ExampleCard>

      <ExampleCard
        title="useLocalStorage"
        description="SSR 안전한 로컬스토리지 훅 — 페이지 새로고침 후에도 값이 유지됩니다"
        techStack="React"
        code={`import { useLocalStorage } from "@/hooks/useLocalStorage";

function PersistDemo() {
  const [name, setName] = useLocalStorage("user-name", "");
  // useState와 동일한 인터페이스, JSON 직렬화 자동 처리

  return (
    <div>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요..."
      />
      <p>저장된 값: {name}</p>
    </div>
  );
}`}
      >
        <LocalStorageDemo />
      </ExampleCard>

      <ExampleCard
        title="Metadata API (SEO)"
        description="Next.js Metadata API로 페이지별 제목, 설명, OG 태그 설정"
        techStack="Next.js"
        language="ts"
        code={`// src/app/about/page.tsx
import type { Metadata } from "next";

// layout.tsx의 template: "%s | Next.js Starter" 적용
export const metadata: Metadata = {
  title: "소개",         // → 브라우저 탭: "소개 | Next.js Starter"
  description: "프로젝트 소개 페이지입니다.",
  openGraph: {
    title: "소개",
    description: "프로젝트 소개 페이지입니다.",
    url: "https://example.com/about",
    type: "website",
  },
};

export default function AboutPage() {
  return <main>...</main>;
}`}
      >
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            root layout의 title template이 적용되어
          </p>
          <p className="mt-2 rounded-lg bg-zinc-100 px-4 py-2 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            소개 | Next.js Starter
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            브라우저 탭 제목이 자동 생성됩니다.
          </p>
        </div>
      </ExampleCard>

      <ExampleCard
        title="폰트 최적화 (next/font)"
        description="next/font/google로 Google Fonts를 레이아웃 시프트 없이 최적화 로드"
        techStack="Next.js"
        code={`// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // 폰트 파일을 빌드 시 번들링 → 외부 네트워크 요청 없음
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html className={\`\${geistSans.variable} \${geistMono.variable}\`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}`}
      >
        <div className="text-center">
          <p className="font-sans text-base font-medium text-zinc-800 dark:text-zinc-200">
            Geist Sans — 본문 텍스트
          </p>
          <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            Geist Mono — 코드 텍스트
          </p>
        </div>
      </ExampleCard>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────

export default function ExamplesPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(
    "components"
  );
  const activeConfig = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      {/* 페이지 헤더 */}
      <div className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <Container className="py-10">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">예제</Badge>
            <Badge variant="secondary">{activeConfig.stack}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            예제 탐색기
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
            실제 동작하는 예제를 통해 스타터킷의 모든 기능을 탐색하고, 각
            예제는 소스 코드와 함께 제공됩니다.
          </p>
        </Container>
      </div>

      {/* 탭 네비게이션 */}
      <div className="sticky top-14 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <Container>
          <div className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* 탭 콘텐츠 */}
      <Container className="py-10">
        {activeTab === "components" && <ComponentsTab />}
        {activeTab === "forms" && <FormsTab />}
        {activeTab === "layouts" && <LayoutsTab />}
        {activeTab === "hooks" && <HooksTab />}
        {activeTab === "data-fetching" && <DataFetchingTab />}
        {activeTab === "optimization" && <OptimizationTab />}
      </Container>
    </div>
  );
}
