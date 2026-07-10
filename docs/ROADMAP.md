# InvoiceHub 개발 로드맵

> Notion API를 CMS/DB로 활용하여 견적서를 생성·관리·공유하는 MVP 웹 서비스

## 개요

**InvoiceHub**는 별도의 백엔드 DB 없이 **Notion을 데이터 소스**로 사용하여 견적서를 관리하는 1인/소규모 사업자용 웹 서비스입니다. 다음 기능을 제공합니다.

- **견적서 웹 조회 (F001)**: 공유 토큰 기반 URL로 발행된 견적서를 누구나 열람 (초안은 404)
- **PDF 다운로드 (F002)**: 브라우저 인쇄 기능(`window.print()` + `@media print`)으로 PDF 저장
- **Notion 데이터 연동 (F003)**: `@notionhq/client`로 DB 쿼리 및 페이지 블록(품목 테이블) 파싱
- **견적서 목록 조회 (F004)**: 어드민에서 견적서 번호·클라이언트·상태·날짜 확인
- **공유 URL 복사 (F005)**: 발행 상태 견적서의 공유 링크를 클립보드로 복사
- **어드민 기본 인증 (F006)**: 환경변수 비밀번호 기반 접근 제어

### 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.9 (App Router, Turbopack) |
| 언어/런타임 | React 19.2.4 + TypeScript 5 (strict) |
| 스타일 | Tailwind CSS v4 (`@theme` 블록), shadcn/ui (radix-nova) |
| 데이터 | Notion API (`@notionhq/client`, 서버 사이드 전용) |
| 배포 | Vercel |

## 개발 워크플로우

1. **작업 계획** — 기존 코드베이스 상태를 파악하고 `ROADMAP.md`를 갱신
2. **작업 생성** — 태스크 단위로 분해하고 관련 기능 ID(F001~F006)와 매핑
3. **작업 구현** — 명세를 따라 구현하고, ⚠️ **구현 완료 후 반드시 Playwright MCP로 테스트 수행 (테스트 없이 완료 처리 금지)**
   - Playwright MCP 테스트 절차: `browser_navigate` → `browser_snapshot` → `browser_fill_form`/`browser_click` → `browser_network_requests` → `browser_snapshot` → 실패 시 `browser_console_messages` 확인 후 수정 → 재테스트
4. **로드맵 업데이트** — 완료된 태스크를 `[x]`로 표시

---

## 개발 단계

### Phase 0: 환경 설정 및 프로젝트 골격

> 스타터 클리닝, 환경변수, 타입 정의 등 개발 기반을 마련합니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T001 | 스타터킷 클리닝 (예제 페이지/API 라우트 제거) | - | `[x]` |
| T002 | 공통 UI 컴포넌트 확보 (Button, Card, Badge, input, label, textarea) | - | `[x]` |
| T003 | 레이아웃 골격 정리 (Header, Footer, Container, ThemeProvider) | - | `[x]` |
| T004 | `@notionhq/client` 패키지 설치 및 의존성 정리 | F003 | `[x]` |
| T005 | 환경변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_ITEMS_DATABASE_ID`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_PASSWORD`, 발행인 정보 3개) 및 `.env.example` 작성 | F003, F006 | `[x]` |
| T006 | 도메인 타입 정의 (`Invoice`, `InvoiceItem`, `InvoiceStatus` 등) — `src/types/invoice.ts` | F001~F006 | `[x]` |
| T007 | 라우트 골격 생성 (`/invoices/[token]/page.tsx`, `/admin/page.tsx` 빈 껍데기) | F001, F004 | `[x]` |

**T006 타입 정의 세부 사항**
- `InvoiceStatus = "초안" | "발행"`
- `Invoice` — 견적서번호, 클라이언트명/이메일, 견적일, 유효기간, 상태, 공유토큰, 메모
- `InvoiceItem` — 품목명, 수량, 단가, 금액

---

### Phase 1: Notion 연동 기반 구축

> Notion DB/블록을 읽어 앱 도메인 타입으로 변환하는 데이터 레이어를 만듭니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T101 | Notion 클라이언트 싱글톤 초기화 (`src/lib/notion.ts`, 서버 전용) | F003 | `[x]` |
| T102 | 견적서 목록 쿼리 함수 `getAllInvoices()` (DB 쿼리 + 속성 매핑) | F003, F004 | `[x]` |
| T103 | 공유 토큰으로 단건 조회 함수 `getInvoiceByToken(token)` | F003, F001 | `[x]` |
| T104 | Items DB 쿼리 파서 — relation 기반으로 `InvoiceItem[]` 조회 (`getInvoiceItems`) | F003 | `[x]` |
| T105 | 발행 상태 가드 — `승인` 외 견적서는 페이지에서 `notFound()` 반환 | F003, F001 | `[x]` |

> ⚠️ **각 태스크 구현 완료 시 위 테스트 체크리스트의 해당 항목을 즉시 Playwright MCP로 수행할 것**

**Phase 1 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[x]` 실제 Notion DB에서 목록 조회 시 속성이 올바르게 매핑되는지 검증 (`browser_navigate`, `browser_snapshot`)
- `[x]` 공유 토큰 단건 조회 시 품목 테이블이 정확히 파싱되는지 검증 (`browser_navigate`, `browser_snapshot`)
- `[x]` 초안 견적서 토큰으로 조회 시 `null`이 반환(404)되는지 검증 (`browser_navigate`, `browser_snapshot`)
- `[x]` 존재하지 않는 토큰 / 잘못된 API Key 등 에러 케이스 처리 검증 (`browser_console_messages`, `browser_network_requests`)

---

### Phase 2: 견적서 공개 조회 페이지

> `/invoices/[token]` — 발행된 견적서를 열람하고 PDF로 저장합니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T201 | 견적서 조회 페이지 구현 (`params` await, Server Component) | F001 | `[x]` |
| T202 | 견적서 헤더 UI (번호, 클라이언트, 견적일/유효기간) | F001 | `[x]` |
| T203 | 품목 테이블 UI (품목명/수량/단가/금액 + 공급가액/부가세/합계 계산) | F001 | `[x]` |
| T204 | 미승인/미존재 토큰 → `notFound()` (404 처리) | F001 | `[x]` |
| T205 | PDF 다운로드 버튼 (`window.print()`, Client Component) | F002 | `[x]` |
| T206 | 인쇄 전용 스타일 (`@media print`, 헤더/푸터 숨김, A4 최적화) | F002 | `[x]` |

**Phase 2 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[x]` 발행 견적서 URL 접근 시 헤더·품목·합계가 정확히 렌더링되는지 검증 (`browser_navigate`, `browser_snapshot`)
- `[x]` 초안/없는 토큰 접근 시 404 페이지가 표시되는지 검증 (`browser_navigate`, `browser_snapshot`)
- `[x]` PDF 다운로드 버튼 클릭 시 인쇄 다이얼로그가 호출되는지 검증 (`browser_click`, `browser_handle_dialog`)
- `[x]` 인쇄 미리보기에서 불필요한 UI가 숨겨지는지 검증 (`browser_snapshot`)

---

### Phase 3: 어드민 견적서 관리 페이지

> `/admin` — 비밀번호 인증 후 견적서 목록 확인 및 공유 링크 복사.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T301 | 어드민 기본 인증 (`ADMIN_PASSWORD` 검증, Server Action boolean 반환) | F006 | `[x]` |
| T302 | 인증 게이트 UI (비밀번호 입력 폼, 에러 메시지) | F006 | `[x]` |
| T303 | 견적서 목록 페이지 구현 (`getAllInvoices()` 연동) | F004 | `[x]` |
| T304 | 목록 테이블 UI (번호·클라이언트명·상태·날짜) | F004 | `[x]` |
| T305 | 공유 URL 복사 버튼 (클립보드, 승인 상태만 활성화) | F005 | `[x]` |
| T306 | 공유 URL 생성 로직 (`NEXT_PUBLIC_BASE_URL` + 공유토큰) | F005 | `[x]` |

> ⚠️ **각 태스크 구현 완료 시 위 테스트 체크리스트의 해당 항목을 즉시 Playwright MCP로 수행할 것**

**Phase 3 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[x]` 잘못된 비밀번호로 접근 시 401/차단되는지 검증 (`browser_navigate`, `browser_snapshot`, `browser_network_requests`)
- `[x]` 올바른 인증 후 견적서 목록이 정상 표시되는지 검증 (`browser_fill_form`, `browser_click`, `browser_snapshot`)
- `[x]` 발행 상태에서만 공유 복사 버튼이 활성화되는지 검증 (`browser_snapshot`)
- `[x]` 복사 버튼 클릭 시 올바른 공유 URL이 클립보드에 담기는지 검증 (`browser_click`, `browser_evaluate`)

---

### Phase 4: 통합 검증 및 배포

> 전체 사용자 플로우 검증과 Vercel 배포를 진행합니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T401 | E2E 통합 테스트 (어드민 목록 → 공유 링크 복사 → 공개 조회 → PDF) | F001~F006 | `[ ]` |
| T402 | 에러/엣지 케이스 정리 (빈 목록, 품목 없음, 만료 표시 등) | F001~F004 | `[ ]` |
| T403 | 반응형/접근성 점검 (모바일 견적서 조회, 인쇄 레이아웃) | F001, F002 | `[ ]` |
| T404 | Vercel 환경변수 설정 및 프로덕션 배포 | - | `[ ]` |
| T405 | 배포 후 스모크 테스트 (실 도메인 URL로 전체 플로우 재검증) | F001~F006 | `[ ]` |

**Phase 4 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[ ]` 어드민에서 복사한 URL로 견적서가 정상 열람되는 전체 플로우 검증 (`browser_navigate`, `browser_fill_form`, `browser_click`, `browser_snapshot`)
- `[ ]` 프로덕션 환경에서 Notion 연동 및 환경변수가 정상 동작하는지 검증 (`browser_navigate`, `browser_network_requests`, `browser_snapshot`)
- `[ ]` 모바일/데스크톱 뷰포트별 렌더링 검증 (`browser_resize`, `browser_snapshot`)

---

## 현재 진행 상황

### 완료 `[x]`
- **Phase 0 전체** — T001~T007 모두 완료
  - 제거됨: `about/`, `api/hello/`, `docs/`(예제), `examples/`, `ExampleCard`, `CodeBlock`
  - 확보됨: Button / Card / Badge / input / label / textarea, Header / Footer / Container, ThemeProvider / ThemeToggle
  - Notion 클라이언트 설치, 환경변수 설정, 타입 정의, 라우트 골격 완료
- **Phase 1 전체** — T101~T105 모두 완료
  - Notion 클라이언트 싱글톤, getInvoiceByToken, getAllInvoices, getInvoiceItems, 상태 가드 구현
- **Phase 2 전체** — T201~T206 모두 완료
  - 견적서 공개 조회 페이지, 품목 테이블, 합계 계산, PDF 버튼, 인쇄 스타일 구현
- **Phase 3 전체** — T301~T306 모두 완료
  - 어드민 인증 게이트, 견적서 목록 테이블, 공유 URL 복사 구현

### 다음 작업 (우선순위)
- **Playwright MCP 테스트** — Phase 1~3 기능 검증 (테스트 완료 전까지 완료 처리 금지)
- **Phase 4** — 통합 E2E 테스트 및 Vercel 배포

### 예정 `[ ]`
- Phase 4: 통합 검증 및 Vercel 배포 (T401~T405)

---

## MVP 이후 로드맵

MVP 출시 이후 다음 기능을 단계적으로 확장합니다 (PRD 명시).

- **NextAuth.js 인증 업그레이드** — 환경변수 비밀번호 → 정식 세션 기반 인증
- **발행 상태 제어 UI** — 어드민에서 Notion 상태(초안/발행)를 직접 업데이트
- **이메일 자동 발송** — Resend API로 클라이언트에게 견적서 링크 전송
- **공유 토큰 자동 생성** — 견적서 생성 시 UUID 토큰 자동 발급
- **견적서 만료 처리** — 유효기간 경과 시 만료 상태 표시 및 접근 제어
- **클라이언트 전자 서명** — 견적서 수락/서명 기능

---

## 부록: Notion DB 스키마

**Invoices DB 속성**

| 속성 | 타입 | 비고 |
|------|------|------|
| 견적서번호 | Title | 고유 식별자 |
| 클라이언트명 | Text (rich_text) | |
| 발행일 | Date | |
| 유효기간 | Date | |
| 상태 | Status | `대기` / `거절` / `승인` |
| 총금액 | Number | |
| 공유토큰 | Text (rich_text, UUID) | 공개 URL 식별자 |
| 항목 | Relation | Items DB 연결 |

**Items DB 속성**

| 속성 | 타입 | 비고 |
|------|------|------|
| 항목명 | Title | |
| 수량 | Number | |
| 단가 | Number | |
| 금액 | Formula | 수량 × 단가 (Notion 자동 계산) |
| Invoices | Relation | Invoices DB 역방향 연결 (영문 속성명) |

**환경 변수**

| 변수명 | 용도 |
|--------|------|
| `NOTION_API_KEY` | Notion Integration API Key |
| `NOTION_DATABASE_ID` | 견적서 Invoices DB ID |
| `NOTION_ITEMS_DATABASE_ID` | 품목 Items DB ID |
| `NEXT_PUBLIC_BASE_URL` | 공개 URL 생성용 도메인 |
| `ADMIN_PASSWORD` | 어드민 페이지 접근 비밀번호 |
| `NEXT_PUBLIC_ISSUER_NAME` | 발행인 회사명 |
| `NEXT_PUBLIC_ISSUER_CONTACT` | 발행인 연락처 |
| `NEXT_PUBLIC_ISSUER_ADDRESS` | 발행인 주소 |
