@AGENTS.md

## 기술 스택

- **Next.js 16.2.9** — App Router 전용, Turbopack 기본 번들러
- **React 19.2.4** + **TypeScript 5** (strict mode)
- **Tailwind CSS v4** — `tailwind.config.ts` 없음, `src/app/globals.css`의 `@theme` 블록으로 설정
- **shadcn/ui** (radix-nova 스타일, CSS 변수 기반, `components.json` 참조)
- **lucide-react** 아이콘, **usehooks-ts** 훅 라이브러리

## 개발 명령어

```bash
npm run dev    # 개발 서버 (http://localhost:3002)
npm run build  # 프로덕션 빌드
npm run lint   # ESLint (next lint 아님 — v16에서 제거됨)
```

## 디렉토리 구조

```
src/
├── app/                     # App Router 페이지 및 레이아웃
│   ├── layout.tsx           # 루트 레이아웃 (폰트, 테마 스크립트)
│   ├── globals.css          # Tailwind v4 설정 + CSS 변수 테마
│   ├── about/page.tsx
│   ├── docs/page.tsx
│   ├── examples/page.tsx
│   └── api/hello/route.ts
├── components/
│   ├── ui/                  # Button, Card, Badge, CodeBlock, input, label, textarea
│   ├── layout/              # Header, Footer, Container
│   ├── theme/               # ThemeProvider, ThemeToggle
│   └── examples/            # ExampleCard
├── hooks/useLocalStorage.ts
└── lib/utils.ts             # cn() 유틸리티 (clsx + tailwind-merge)
```

경로 별칭: `@/*` → `./src/*` (예: `import { cn } from "@/lib/utils"`)

## Next.js 16 필수 주의사항

**코드 작성 전 반드시 `node_modules/next/dist/docs/` 문서를 확인할 것.**

주요 Breaking Changes:

1. **`params` / `searchParams` 반드시 await**
   ```tsx
   // 틀림: const { slug } = params
   const { slug } = await params
   const q = (await searchParams).q
   ```

2. **`middleware.ts` → `proxy.ts`** 파일명 및 export 함수명 변경
   ```ts
   // proxy.ts
   export function proxy(request: Request) { ... }
   ```

3. **`next lint` 명령 제거** — `npm run lint`는 ESLint 직접 호출

4. **Parallel Routes의 `@slot`에 `default.tsx` 필수** (없으면 build 실패)

5. **`revalidateTag()` 두 번째 인자(cacheLife profile) 필수**
   ```ts
   revalidateTag('posts', 'max')
   ```

6. **`serverRuntimeConfig` / `publicRuntimeConfig` 제거** → 환경변수 직접 사용

## 코드 패턴

**Server vs Client 컴포넌트:**
- 상호작용(`useState`, `useEffect`, 이벤트 핸들러)이 필요한 경우만 `"use client"` 추가
- 기본값은 Server Component

**스타일링:**
```tsx
import { cn } from "@/lib/utils"

// Tailwind 클래스 동적 조합은 항상 cn() 사용
<div className={cn("base-class", isActive && "active-class")} />
```

**Tailwind v4 색상** — OKLch 색상 공간, CSS 변수(`--primary`, `--background` 등) 사용:
```css
/* globals.css에서 정의 */
:root { --primary: oklch(0.205 0 0); }
.dark { --primary: oklch(0.922 0 0); }
```

**컴포넌트 import:**
```tsx
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
```
