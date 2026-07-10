# InvoiceHub 개발 표준 (AI Agent 전용)

## 1. 프로젝트 개요

- **서비스**: Notion API를 DB로 활용하는 견적서 공유 MVP — `InvoiceHub`
- **구현 범위**: 두 페이지만 존재
  - `/invoices/[token]` — 공개 견적서 조회 (F001, F002, F003)
  - `/admin` — 어드민 견적서 목록 (F004, F005, F006)
- **데이터 소스**: Notion DB 단일 소스 (`@notionhq/client` 서버 사이드 전용)
- **기능 명세 원본**: `docs/PRD.md` 참조

---

## 2. 기술 스택 버전 (학습 데이터와 다를 수 있음)

| 라이브러리 | 버전 | 비고 |
|-----------|------|------|
| Next.js | 16.2.9 | App Router 전용, Turbopack 기본 |
| React | 19.2.4 | — |
| TypeScript | 5 | strict mode |
| Tailwind CSS | v4 | `tailwind.config.ts` 없음 |
| shadcn/ui | radix-nova 스타일 | `components.json` 참조 |
| lucide-react | ^1.21.0 | 아이콘 라이브러리 |
| usehooks-ts | ^3.1.1 | 훅 라이브러리 |

---

## 3. Next.js 16 필수 규칙 (Breaking Changes)

> **경고**: 아래 항목은 Next.js 13~15 방식과 다르다. 반드시 준수할 것.

### 3-1. params / searchParams 반드시 await

```tsx
// ❌ 금지
export default function Page({ params }: { params: { token: string } }) {
  const { token } = params
}

// ✅ 필수
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const q = (await searchParams).q
}
```

### 3-2. 미들웨어 파일명 변경

```ts
// ❌ 금지: middleware.ts / export function middleware()
// ✅ 필수: proxy.ts / export function proxy()

// proxy.ts
export function proxy(request: Request) { ... }
```

### 3-3. 린트 명령어

```bash
# ❌ 금지 (v16에서 제거됨)
next lint

# ✅ 필수
npm run lint   # ESLint 직접 호출
```

### 3-4. Parallel Routes

- `@slot` 폴더를 사용할 때 반드시 `default.tsx` 추가 (없으면 빌드 실패)

### 3-5. revalidateTag() 두 번째 인자 필수

```ts
// ❌ 금지
revalidateTag('invoices')

// ✅ 필수
revalidateTag('invoices', 'max')
```

### 3-6. 런타임 설정 제거

- `serverRuntimeConfig` / `publicRuntimeConfig` 사용 금지 → 환경변수(`process.env`) 직접 사용

---

## 4. 디렉토리 구조 및 파일 위치 규칙

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 — 수정 시 ThemeProvider/Header/Footer 연동 확인
│   ├── globals.css         # Tailwind v4 @theme 블록 + CSS 변수 — 스타일 추가는 여기
│   ├── page.tsx            # 홈 페이지
│   ├── invoices/
│   │   └── [token]/
│   │       └── page.tsx    # F001/F002/F003 — 공개 견적서 조회 (Server Component)
│   └── admin/
│       └── page.tsx        # F004/F005/F006 — 어드민 목록 (Server Component)
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트 — npx shadcn add 로만 추가
│   ├── layout/             # Header, Footer, Container
│   └── theme/              # ThemeProvider, ThemeToggle
├── hooks/                  # 클라이언트 훅 (useLocalStorage 등)
├── lib/
│   └── utils.ts            # cn() 유틸리티만 위치
└── types/                  # 공유 TypeScript 타입 정의 (필요 시 생성 — 현재 미존재)
```

### 새 파일 추가 시 연동 필수 항목

| 추가 대상 | 동시 수정 파일 |
|-----------|--------------|
| 새 페이지(`app/*/page.tsx`) | `CLAUDE.md` 디렉토리 구조 섹션 + `src/components/layout/Header.tsx` `navLinks` 배열 |
| 새 환경변수 | `docs/PRD.md` 환경변수 섹션 + `.env.example` (없으면 생성) |
| 새 shadcn 컴포넌트 | `components.json` 자동 반영 (`npx shadcn add` 사용 시) |
| `Header.tsx` navLinks 수정 | `src/app/page.tsx` 홈 페이지 버튼 링크와 동기화 확인 |

---

## 5. Tailwind CSS v4 규칙

- **`tailwind.config.ts` 생성 금지** — v4에서는 `src/app/globals.css`의 `@theme inline { }` 블록으로 설정
- 새 디자인 토큰 추가 → `globals.css`의 `@theme inline` 블록 내 CSS 변수 추가
- 다크모드 → `.dark { }` 블록에서 동일 변수 재정의
- 색상 공간: OKLch (`oklch(L C H)`)

```css
/* globals.css — 커스텀 색상 추가 예시 */
@theme inline {
  --color-brand: var(--brand);
}
:root { --brand: oklch(0.6 0.15 200); }
.dark { --brand: oklch(0.75 0.12 200); }
```

- Tailwind 클래스 동적 조합은 항상 `cn()` 사용:

```tsx
import { cn } from "@/lib/utils"
<div className={cn("base", isActive && "active")} />
```

---

## 6. 컴포넌트 규칙

### 6-1. Server vs Client 컴포넌트

- 기본값: **Server Component** (파일 상단 지시어 없음)
- `"use client"` 추가 조건: `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API 사용 시만
- Notion API 호출은 **Server Component에서만** — Client Component에서 직접 호출 절대 금지

### 6-2. shadcn/ui 컴포넌트

- **이미 설치된 컴포넌트**: Button, Card, Badge, input, label, textarea
- 새 컴포넌트 추가: `npx shadcn add [component-name]`
- 스타일: radix-nova, CSS 변수 기반 (`components.json` 참조)
- import 경로 파일명 규칙:

```tsx
// 대문자 파일명
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// 소문자 파일명 (예외)
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
```

### 6-3. lucide-react 아이콘

```tsx
import { Copy, Check, Download, RefreshCw } from "lucide-react"
// 아이콘 크기는 Tailwind로 제어: className="size-4"
```

---

## 7. Notion API 연동 규칙 (F003)

### 7-1. 필수 환경변수

```env
NOTION_API_KEY=secret_xxx              # Notion Integration API Key
NOTION_DATABASE_ID=xxx                 # 견적서 Invoices DB ID
NOTION_ITEMS_DATABASE_ID=xxx           # 품목 Items DB ID
NEXT_PUBLIC_BASE_URL=https://...       # 공개 URL 생성용 도메인
ADMIN_PASSWORD=your_secret_password    # 어드민 인증 비밀번호 (F006)
NEXT_PUBLIC_ISSUER_NAME=회사명          # 발행인 회사명 (견적서 표시)
NEXT_PUBLIC_ISSUER_CONTACT=010-0000-0000 # 발행인 연락처
NEXT_PUBLIC_ISSUER_ADDRESS=서울시 강남구  # 발행인 주소
```

### 7-2. Notion API 호출 패턴

```ts
// Server Component 또는 Server Action에서만 호출
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_API_KEY })

// 공유토큰으로 견적서 조회
const response = await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID!,
  filter: {
    property: "공유토큰",
    rich_text: { equals: token },
  },
})

// Items DB에서 relation으로 품목 조회
const itemsRes = await notion.databases.query({
  database_id: process.env.NOTION_ITEMS_DATABASE_ID!,
  filter: { property: "Invoices", relation: { contains: pageId } },
})
```

### 7-3. 상태 검증 규칙 (F001 핵심)

```ts
import { notFound } from "next/navigation"

// 상태가 '승인'이 아니면 반드시 404 반환
if (!invoice || invoice.상태 !== "승인") {
  notFound()
}
```

- `대기` / `거절` 상태 견적서: 공유토큰이 유효해도 `notFound()` 호출
- 공유토큰 미매칭: `notFound()` 호출

### 7-4. Notion DB 속성 매핑

**Invoices DB:**

| Notion 속성명 | 타입 | 접근 방법 |
|-------------|------|---------|
| 견적서번호 | Title | `page.properties.견적서번호.title[0].plain_text` |
| 클라이언트명 | rich_text | `page.properties.클라이언트명.rich_text[0].plain_text` |
| 발행일 | Date | `page.properties.발행일.date?.start` |
| 유효기간 | Date | `page.properties.유효기간.date?.start` |
| 상태 | Status | `page.properties.상태.status?.name` → `"대기" \| "거절" \| "승인"` |
| 총금액 | Number | `page.properties.총금액.number` |
| 공유토큰 | rich_text | `page.properties.공유토큰.rich_text[0].plain_text` |

**Items DB:**

| Notion 속성명 | 타입 | 접근 방법 |
|-------------|------|---------|
| 항목명 | Title | `page.properties.항목명.title[0].plain_text` |
| 수량 | Number | `page.properties.수량.number` |
| 단가 | Number | `page.properties.단가.number` |
| 금액 | Formula | `page.properties.금액.formula.number` |
| Invoices | Relation | `page.properties.Invoices.relation` (영문 속성명) |

---

## 8. 기능별 구현 규칙

### F001 — 견적서 웹 조회

- `src/app/invoices/[token]/page.tsx` — Server Component
- `await params`로 token 추출
- Notion DB 필터 → 상태 검증 → 블록 파싱 → 렌더링
- 잘못된 토큰 또는 비승인 상태(`대기`/`거절`) → `notFound()`

### F002 — PDF 다운로드

- `window.print()` 호출만 사용 — puppeteer, jspdf 등 외부 라이브러리 설치 금지
- `"use client"` Client Component로 PDF 버튼 분리
- `@media print` CSS는 `globals.css`에 작성:
  ```css
  @media print {
    .no-print { display: none !important; }
    /* 헤더/푸터/버튼 숨김 */
  }
  ```

### F003 — Notion 데이터 연동

- `cache: 'no-store'` 옵션으로 항상 최신 데이터 보장 (ISR 미적용)
- `@notionhq/client` 단일 SDK 사용

### F004 — 견적서 목록 조회

- `src/app/admin/page.tsx` — Client Component (`"use client"`, Server Action으로 데이터 조회)
- `getAllInvoices()` Server Action → Notion DB 전체 조회, 발행일 내림차순 정렬
- `상태` 속성으로 Badge 색상 구분: 대기(secondary/회색), 거절(destructive/빨강), 승인(success/초록)

### F005 — 공유 URL 복사

- `navigator.clipboard.writeText()` 사용 — Client Component에서 처리
- 복사 성공 후 1.5초간 Check 아이콘 표시 후 원복

### F006 — 어드민 기본 인증

- 환경변수 `ADMIN_PASSWORD`와 비교 — Server Action(`validateAdminPassword`)에서 처리
- 불일치 시 `false` 반환 → 클라이언트에서 에러 메시지 표시 (비밀번호 서버 외부 노출 없음)
- 인증 상태는 `useState`로 클라이언트 관리 (세션 없음, 새로고침 시 초기화 — MVP 의도된 동작)

---

## 9. UI/UX 구현 규칙

### 견적서 레이아웃

- A4 비율 고정 너비: `max-w-[794px] mx-auto`
- 인쇄 시 Header, Footer, PDF 버튼 숨김 (`@media print`)

### 한국어 포맷

```ts
// 금액 포맷
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n)

// 날짜 포맷
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
// 결과: "2026년 6월 30일"
```

---

## 10. 경로 별칭

```ts
// 항상 @/* 별칭 사용 — 상대 경로 사용 금지
import { cn } from "@/lib/utils"        // ✅
import { cn } from "../../lib/utils"    // ❌
```

---

## 11. 금지 사항

| 금지 행위 | 이유 |
|----------|------|
| Client Component에서 Notion API 직접 호출 | API Key 노출 |
| `tailwind.config.ts` 생성 | Tailwind v4 방식 위반 |
| `next lint` 명령 사용 | v16에서 제거됨 |
| `middleware.ts` 파일 생성 | proxy.ts로 변경됨 |
| puppeteer, jspdf 등 PDF 라이브러리 설치 | PDF는 window.print()만 사용 |
| `@notionhq/client` 외 Notion SDK 사용 | 공식 SDK 외 허용 안 함 |
| `serverRuntimeConfig` / `publicRuntimeConfig` 사용 | v16에서 제거됨 |
| params를 await 없이 직접 구조분해 | Next.js 16 breaking change |
| ISR(revalidate) 적용 | 이 프로젝트는 cache: 'no-store' 정책 |
| MVP 이후 기능 선제 구현 | 이메일 발송, 전자서명, 다국어 등 — PRD 외 기능 추가 금지 |
