import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";

export const metadata: Metadata = {
  title: "문서",
};

// ── 사이드바 네비게이션 구조 ─────────────────────────────────────────

const NAV = [
  {
    title: "시작하기",
    links: [
      { href: "#intro", label: "소개" },
      { href: "#installation", label: "설치" },
      { href: "#structure", label: "프로젝트 구조" },
    ],
  },
  {
    title: "UI 컴포넌트",
    stack: "shadcn/ui",
    links: [
      { href: "#button", label: "Button" },
      { href: "#card", label: "Card" },
      { href: "#badge", label: "Badge" },
      { href: "#input", label: "Input / Label / Textarea" },
    ],
  },
  {
    title: "훅 라이브러리",
    stack: "usehooks-ts",
    links: [
      { href: "#use-local-storage", label: "useLocalStorage" },
      { href: "#usehooks-ts", label: "usehooks-ts" },
    ],
  },
  {
    title: "구성 및 설정",
    stack: "Next.js",
    links: [
      { href: "#tailwind", label: "Tailwind CSS v4" },
      { href: "#shadcn-config", label: "shadcn/ui 설정" },
      { href: "#dark-mode", label: "다크모드" },
    ],
  },
];

// ── 공통 스타일 ───────────────────────────────────────────────────────

const h2 = "mt-16 scroll-mt-24 text-2xl font-bold text-zinc-900 dark:text-zinc-50 first:mt-0";
const h3 = "mt-8 scroll-mt-24 text-lg font-semibold text-zinc-800 dark:text-zinc-100";
const p = "mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400";
const ul = "mt-3 space-y-1.5 text-zinc-600 dark:text-zinc-400";
const li = "flex items-start gap-2 before:mt-2 before:inline-block before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-zinc-400";
const table = "mt-4 w-full overflow-hidden rounded-lg border border-zinc-200 text-sm dark:border-zinc-800";
const th = "border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";
const td = "px-4 py-2.5 text-zinc-600 dark:text-zinc-400";
const tr = "border-b border-zinc-100 last:border-0 dark:border-zinc-800/50";
const inlineCode = "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";

export default function DocsPage() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      {/* 페이지 헤더 */}
      <div className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <Container className="py-10">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">문서</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            가이드
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-500 dark:text-zinc-400">
            Next.js 스타터킷 사용법과 모든 기능에 대한 상세한 가이드를 제공합니다.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex gap-12">
          {/* ── 사이드바 ── */}
          <aside className="hidden w-48 shrink-0 md:block">
            <nav className="sticky top-24 space-y-6">
              {NAV.map(({ title, stack, links }) => (
                <div key={title}>
                  <div className="mb-2 flex items-center gap-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {title}
                    </p>
                    {stack && (
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {stack}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-0.5">
                    {links.map(({ href, label }) => (
                      <li key={href}>
                        <a
                          href={href}
                          className="block rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* ── 본문 ── */}
          <main className="min-w-0 flex-1">

            {/* ═══════════════════════════════════════════════════
                시작하기
            ════════════════════════════════════════════════════ */}
            <section>
              <h2 id="intro" className={h2}>시작하기</h2>
              <p className={p}>
                Next.js 스타터킷은 프로덕션 수준의 Next.js 애플리케이션을 빠르게 시작할 수 있도록
                설계된 템플릿입니다. 최신 기술 스택과 권장 설정이 미리 구성되어 있어, 비즈니스
                로직 개발에 집중할 수 있습니다.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { name: "Next.js 16", desc: "App Router" },
                  { name: "React 19", desc: "Server Components" },
                  { name: "TypeScript 5", desc: "Strict mode" },
                  { name: "Tailwind CSS v4", desc: "CSS-first config" },
                  { name: "shadcn/ui", desc: "radix-nova style" },
                  { name: "usehooks-ts", desc: "React hooks library" },
                ].map(({ name, desc }) => (
                  <div
                    key={name}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
                  </div>
                ))}
              </div>

              <h3 id="installation" className={h3}>설치</h3>
              <p className={p}>저장소를 클론하고 의존성을 설치합니다.</p>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="bash"
                code={`# 저장소 클론
git clone https://github.com/your-username/claude-nextjs-starters.git
cd claude-nextjs-starters

# 의존성 설치
npm install

# 개발 서버 시작 (포트 3002)
npm run dev`}
              />

              <h3 id="structure" className={h3}>프로젝트 구조</h3>
              <p className={p}>
                <code className={inlineCode}>src/</code> 디렉토리 아래에 모든 소스 코드가 위치합니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="text"
                code={`src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃 (폰트, 테마, 메타데이터)
│   ├── page.tsx            # 홈 페이지
│   ├── examples/           # 예제 페이지
│   ├── docs/               # 문서 페이지
│   ├── api/hello/          # API Route 예시
│   └── globals.css         # Tailwind v4 + 테마 CSS 변수
│
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── Button.tsx      # CVA 기반 버튼 (6 variants, 4 sizes)
│   │   ├── Card.tsx        # 카드 컨테이너
│   │   ├── Badge.tsx       # 배지 (4 variants)
│   │   ├── input.tsx       # 텍스트 입력
│   │   ├── label.tsx       # 폼 레이블
│   │   ├── textarea.tsx    # 여러 줄 입력
│   │   └── CodeBlock.tsx   # 코드 표시 + 복사 버튼
│   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── Header.tsx      # 헤더 (반응형, 모바일 메뉴)
│   │   ├── Footer.tsx      # 푸터
│   │   └── Container.tsx   # max-w-5xl 래퍼
│   ├── theme/              # 테마 시스템
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── examples/
│       └── ExampleCard.tsx # 예제 카드 (프리뷰 + 코드 토글)
│
├── hooks/
│   └── useLocalStorage.ts  # SSR 안전 localStorage 훅
│
└── lib/
    └── utils.ts            # cn() 유틸리티`}
              />
            </section>

            {/* ═══════════════════════════════════════════════════
                UI 컴포넌트
            ════════════════════════════════════════════════════ */}
            <section>
              <h2 id="button" className={h2}>Button</h2>
              <p className={p}>
                <code className={inlineCode}>class-variance-authority</code>를 기반으로 구현된 버튼
                컴포넌트입니다. <code className={inlineCode}>asChild</code> prop으로 Link나 a 태그로도
                렌더링할 수 있습니다.
              </p>

              <h3 className={h3}>Variants</h3>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>variant</th>
                    <th className={th}>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["default", "기본 스타일. 검정 배경 (다크모드: 흰색)"],
                    ["outline", "테두리 스타일. 배경 없음"],
                    ["secondary", "보조 스타일. 회색 계열 배경"],
                    ["ghost", "배경 없음. 호버 시에만 배경 표시"],
                    ["destructive", "위험/삭제 작업. 빨간색 계열"],
                    ["link", "텍스트 링크 스타일. 밑줄 표시"],
                  ].map(([v, d]) => (
                    <tr key={v} className={tr}>
                      <td className={td}>
                        <code className={inlineCode}>{v}</code>
                      </td>
                      <td className={td}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className={h3}>Sizes</h3>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>size</th>
                    <th className={th}>높이</th>
                    <th className={th}>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["xs", "h-6", "매우 작은 버튼"],
                    ["sm", "h-7", "작은 버튼"],
                    ["default", "h-8", "기본 크기"],
                    ["lg", "h-9", "큰 버튼"],
                    ["icon", "8×8", "정사각형 아이콘 버튼"],
                  ].map(([s, h, d]) => (
                    <tr key={s} className={tr}>
                      <td className={td}><code className={inlineCode}>{s}</code></td>
                      <td className={td}><code className={inlineCode}>{h}</code></td>
                      <td className={td}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className={h3}>사용 예시</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`import { Button } from "@/components/ui/Button";
import Link from "next/link";

// 기본 버튼
<Button>클릭</Button>
<Button variant="outline" size="sm">작은 버튼</Button>

// Link 컴포넌트로 렌더링
<Button asChild>
  <Link href="/examples">예제 보기</Link>
</Button>

// 비활성화
<Button disabled>비활성</Button>`}
              />

              <h2 id="card" className={h2}>Card</h2>
              <p className={p}>
                카드 레이아웃을 위한 컴포넌트 세트입니다.
                <code className={inlineCode}>Card</code>,{" "}
                <code className={inlineCode}>CardHeader</code>,{" "}
                <code className={inlineCode}>CardTitle</code>,{" "}
                <code className={inlineCode}>CardContent</code>를 조합하여 사용합니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    본문 내용이 여기에 들어갑니다.
  </CardContent>
</Card>

{/* className으로 추가 스타일 적용 */}
<Card className="hover:shadow-md transition-shadow">
  ...
</Card>`}
              />

              <h2 id="badge" className={h2}>Badge</h2>
              <p className={p}>
                상태나 카테고리를 표시하는 뱃지 컴포넌트입니다.
              </p>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>variant</th>
                    <th className={th}>색상</th>
                    <th className={th}>용도</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["default", "검정/흰색", "일반 레이블"],
                    ["secondary", "회색", "보조 정보"],
                    ["success", "에메랄드", "성공, 완료 상태"],
                    ["destructive", "빨간색", "오류, 위험 상태"],
                  ].map(([v, c, u]) => (
                    <tr key={v} className={tr}>
                      <td className={td}><code className={inlineCode}>{v}</code></td>
                      <td className={td}>{c}</td>
                      <td className={td}>{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`import Badge from "@/components/ui/Badge";

<Badge>기본</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="success">완료</Badge>
<Badge variant="destructive">오류</Badge>`}
              />

              <h2 id="input" className={h2}>Input / Label / Textarea</h2>
              <p className={p}>
                shadcn/ui 폼 컴포넌트입니다. CSS 변수 기반의 테마 시스템을 따르며 다크모드를
                자동으로 지원합니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

{/* 기본 텍스트 입력 */}
<div className="space-y-1">
  <Label htmlFor="email">이메일</Label>
  <Input id="email" type="email" placeholder="hong@example.com" />
</div>

{/* 오류 상태 */}
<Input aria-invalid={true} />

{/* 여러 줄 입력 */}
<div className="space-y-1">
  <Label htmlFor="msg">메시지</Label>
  <Textarea id="msg" rows={4} placeholder="내용을 입력하세요..." />
</div>`}
              />
            </section>

            {/* ═══════════════════════════════════════════════════
                훅 라이브러리
            ════════════════════════════════════════════════════ */}
            <section>
              <h2 id="use-local-storage" className={h2}>useLocalStorage</h2>
              <p className={p}>
                <code className={inlineCode}>src/hooks/useLocalStorage.ts</code>에 구현된 커스텀 훅입니다.
                SSR 환경에서 안전하게 동작하며 JSON 직렬화를 자동으로 처리합니다.
              </p>

              <h3 className={h3}>시그니처</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="ts"
                code={`function useLocalStorage<T>(
  key: string,       // localStorage 키
  initialValue: T    // 초기값 (키가 없을 때 사용)
): [T, (value: T | ((prev: T) => T)) => void]`}
              />

              <h3 className={h3}>사용 예시</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`"use client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

function UserPreferences() {
  const [theme, setTheme] = useLocalStorage("theme", "system");
  const [fontSize, setFontSize] = useLocalStorage("font-size", 16);

  // useState와 동일한 방식으로 사용
  return (
    <div>
      <button onClick={() => setTheme("dark")}>다크 모드</button>
      <button onClick={() => setFontSize((prev) => prev + 2)}>
        글자 크기 증가
      </button>
    </div>
  );
}`}
              />

              <h2 id="usehooks-ts" className={h2}>usehooks-ts</h2>
              <p className={p}>
                TypeScript로 작성된 React 훅 모음입니다.{" "}
                <code className={inlineCode}>npm install usehooks-ts</code>로 설치되어 있습니다.
              </p>

              <ul className={ul}>
                {[
                  ["useToggle", "불리언 토글 — ON/OFF 전환"],
                  ["useCounter", "숫자 카운터 — 증가/감소/초기화"],
                  ["useDebounce", "값 변경 지연 — 검색 입력에 유용"],
                  ["useMediaQuery", "CSS 미디어 쿼리 구독"],
                  ["useLocalStorage", "localStorage 읽기/쓰기"],
                  ["useWindowSize", "뷰포트 크기 추적"],
                  ["useClickAnyWhere", "전역 클릭 이벤트 리스너"],
                  ["useInterval", "setInterval 래퍼"],
                ].map(([name, desc]) => (
                  <li key={name} className={li}>
                    <code className={inlineCode}>{name}</code>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>

              <h3 className={h3}>핵심 훅 예시</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`import {
  useToggle,
  useCounter,
  useDebounceValue,
  useMediaQuery,
} from "usehooks-ts";

// useToggle
const [isOpen, toggle, setIsOpen] = useToggle(false);

// useCounter
const { count, increment, decrement, reset } = useCounter(0);

// useDebounceValue — 500ms 지연
const [query, setQuery] = useState("");
const [debouncedQuery] = useDebounceValue(query, 500);

// useMediaQuery
const isMobile = useMediaQuery("(max-width: 768px)");
const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");`}
              />
            </section>

            {/* ═══════════════════════════════════════════════════
                구성 및 설정
            ════════════════════════════════════════════════════ */}
            <section>
              <h2 id="tailwind" className={h2}>Tailwind CSS v4</h2>
              <p className={p}>
                Tailwind CSS v4는 별도의 <code className={inlineCode}>tailwind.config.ts</code> 파일 없이
                CSS 파일 내에서 <code className={inlineCode}>@theme</code> 블록으로 테마를 설정합니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="css"
                code={`/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  /* 색상 변수 — OKLch 색상 공간 사용 */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);

  /* 폰트 패밀리 */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Border radius */
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
}

/* 다크모드 — .dark 클래스 기반 */
.dark {
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0 0);
}`}
              />

              <h2 id="shadcn-config" className={h2}>shadcn/ui 설정</h2>
              <p className={p}>
                <code className={inlineCode}>components.json</code>이 shadcn/ui의 설정 파일입니다.
                <code className={inlineCode}>npx shadcn@latest add [컴포넌트]</code> 명령으로 새 컴포넌트를
                추가할 수 있습니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="json"
                code={`// components.json
{
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  }
}`}
              />
              <h3 className={h3}>컴포넌트 추가</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="bash"
                code={`# 단일 컴포넌트 추가
npx shadcn@latest add dialog

# 여러 컴포넌트 한 번에 추가
npx shadcn@latest add select checkbox radio-group

# 사용 가능한 컴포넌트 목록 확인
npx shadcn@latest list`}
              />

              <h2 id="dark-mode" className={h2}>다크모드</h2>
              <p className={p}>
                다크모드는 세 가지 레이어로 구현됩니다: FOUC 방지 스크립트, Context 기반 상태 관리,
                CSS 변수 전환.
              </p>

              <h3 className={h3}>ThemeProvider 사용</h3>
              <CodeBlock
                className="mt-3 rounded-lg"
                code={`"use client";
import { useTheme } from "@/components/theme/ThemeProvider";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // theme: "light" | "dark" | "system"
  // resolvedTheme: "light" | "dark" (실제 적용 테마)

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      현재: {resolvedTheme}
    </button>
  );
}`}
              />

              <h3 className={h3}>FOUC 방지</h3>
              <p className={p}>
                <code className={inlineCode}>src/app/layout.tsx</code>의 인라인 스크립트가 HTML 렌더링
                전에 실행되어 다크모드 플래시(FOUC)를 방지합니다.
              </p>
              <CodeBlock
                className="mt-3 rounded-lg"
                language="ts"
                code={`// layout.tsx — <body> 태그 이전에 실행
<script dangerouslySetInnerHTML={{
  __html: \`(function() {
    try {
      var t = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (!t || t === 'system') && prefersDark) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })()\`
}} />`}
              />
            </section>

          </main>
        </div>
      </Container>
    </div>
  );
}
