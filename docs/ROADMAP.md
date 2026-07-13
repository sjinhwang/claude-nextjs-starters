# InvoiceHub 고도화 로드맵 (v2)

> MVP(Phase 0~4, T001~T405) 완료 이후의 **고도화 단계** 로드맵입니다.
> MVP 개발 히스토리는 `docs/roadmaps/ROADMAP_v1.md`에 아카이브되어 있습니다.

## 개요

MVP는 견적서 웹 조회(F001)·PDF 다운로드(F002)·Notion 연동(F003)·어드민 목록(F004)·공유 URL(F005)·어드민 인증(F006)을 갖춘 상태로 배포 완료되었습니다. 이번 v2는 실제 사용 과정에서 드러난 **관리 UX 갭**을 메우는 데 집중합니다. 사용자가 명시적으로 요청한 3가지가 최우선 스코프입니다.

- **어드민 레이아웃 (요구사항 1)**: 견적서 목록을 전용 관리자 레이아웃에서 조회 — 현재 세션 미지속(새로고침 시 인증 풀림) 문제 개선 포함
- **공유 링크 복사 (요구사항 2)**: 목록에서 클라이언트 전달용 공개 URL을 클립보드로 복사 — PRD F005의 실질적 완성
- **다크모드 커버리지 (요구사항 3)**: 인프라는 이미 완비 → 누락 페이지(특히 공개 조회 페이지) 정책 결정 및 일관성 QA

### 코드베이스 현황 진단 (이번 스코프의 근거)

로드맵을 실제 갭에 맞추기 위해 착수 전 코드 상태를 조사한 결과입니다. **이미 되어 있는 것을 다시 만들지 않도록** 태스크를 설계했습니다.

| 영역 | 현재 상태 | 갭 / 조치 방향 |
|------|-----------|----------------|
| 어드민 레이아웃 | `src/app/admin/layout.tsx` 없음. 단일 `page.tsx`(`"use client"`)가 `phase: "auth" \| "list"` state로 인증/목록 화면을 토글 | 전용 `admin/layout.tsx` 신설, 세션 지속(쿠키) 도입 |
| 어드민 세션 | 세션/쿠키 없음 → 새로고침 시 인증 상태 소실, 매번 재로그인 | 서버 검증 쿠키 기반 세션으로 지속성 확보 |
| 공유 링크 복사 (F005) | 목록 마지막 열은 "미리보기"(Eye, `window.open`) 버튼뿐. **클립보드 복사 버튼은 미구현** (`handlePreview`, `admin/page.tsx:84-88`) | 복사 버튼 신규 추가 (미리보기 버튼은 유지, 두 버튼 병행) |
| 다크모드 인프라 | `ThemeProvider`·`ThemeToggle`·FOUC 스크립트(`layout.tsx`)·Header 토글 **완비** | 신규 구축 불필요 |
| 다크모드 – 어드민 | `admin/page.tsx`에 `dark:` 클래스 적용 완료 | QA 점검만 |
| 다크모드 – 공개 조회 | `invoices/[token]/page.tsx`는 `bg-white text-zinc-900` 하드코딩, `dark:` 전무. 인쇄 전용(A4, `@media print`, "폰트 검정 고정")과 상충 소지 | **정책 결정 필요**: 화면은 다크 지원 + 인쇄 시 라이트 강제 |

### 기술 스택 (변동 없음)

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.9 (App Router, Turbopack) |
| 언어/런타임 | React 19.2.4 + TypeScript 5 (strict) |
| 스타일 | Tailwind CSS v4 (`@theme` 블록), shadcn/ui (radix-nova) |
| 데이터 | Notion API (`@notionhq/client`, 서버 사이드 전용) |
| 배포 | Vercel |

> ⚠️ **Next.js 16 주의**: `params`/`searchParams` await, `middleware.ts` → `proxy.ts`, 코드 작성 전 `node_modules/next/dist/docs/` 확인 (CLAUDE.md 참조).

### 신규 기능 ID (v2)

| ID | 기능명 | 요구사항 |
|----|--------|----------|
| **F007** | 어드민 전용 레이아웃 + 세션 지속 | 요구사항 1 |
| **F008** | 공유 링크 클립보드 복사 | 요구사항 2 (PRD F005 실질 완성) |
| **F009** | 다크모드 커버리지 완성 | 요구사항 3 |

## 개발 워크플로우

1. **작업 계획** — 기존 코드베이스 상태를 파악하고 `ROADMAP.md`를 갱신
2. **작업 생성** — 태스크 단위로 분해하고 관련 기능 ID(F001~F009)와 매핑
3. **작업 구현** — 명세를 따라 구현하고, ⚠️ **구현 완료 후 반드시 Playwright MCP로 테스트 수행 (테스트 없이 완료 처리 금지)**
   - Playwright MCP 절차: `browser_navigate` → `browser_snapshot` → `browser_fill_form`/`browser_click` → `browser_network_requests` → `browser_snapshot` → 실패 시 `browser_console_messages` 확인 후 수정 → 재테스트
4. **로드맵 업데이트** — 완료된 태스크를 `[x]`로 표시

---

## 개발 단계

### Phase 5: 어드민 레이아웃 & 세션 지속 — 우선순위 (F007)

> `src/app/admin/layout.tsx`를 신설해 관리자 전용 레이아웃을 구축하고, 새로고침에도 인증이 유지되도록 쿠키 기반 세션을 도입합니다. **가장 먼저 착수합니다.**

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T501 | 어드민 세션 도입 — 인증 성공 시 서명/검증 가능한 세션 쿠키 발급(`httpOnly`, `sameSite`), 만료 설정. Server Action 또는 Route Handler | F006, F007 | `[x]` |
| T502 | `admin/layout.tsx` 신설 — 관리자 전용 골격(사이드바/헤더, 로그아웃 버튼). Server Component에서 세션 쿠키 검증 후 미인증 시 인증 화면으로 유도 | F007 | `[x]` |
| T503 | 인증 게이트를 세션 기반으로 재구성 — 기존 `phase` state 토글을 쿠키 검증 흐름으로 이전, 새로고침 시 인증 유지 | F006, F007 | `[x]` |
| T504 | 로그아웃 기능 — 세션 쿠키 무효화 후 인증 화면으로 복귀 | F007 | `[x]` |
| T505 | 목록 페이지를 레이아웃 구조에 맞게 정리 — 기존 목록 UI(테이블/새로고침)는 유지, 레이아웃과 페이지 책임 분리 | F004, F007 | `[x]` |

> Rate limit(`src/lib/rate-limit.ts`, IP 기준 분당 10회)은 기존 로직을 재사용합니다. 인증 방식만 세션 쿠키로 확장합니다.

**Phase 5 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[x]` 올바른 비밀번호 인증 후 `/admin` **새로고침 시에도 목록이 유지**되는지 검증 — 사용자가 브라우저에서 직접 확인, 정상
- `[x]` 미인증 상태로 `/admin` 직접 접근 시 인증 화면이 노출되고 목록이 차단되는지 검증 — curl로 정상/위조/만료 세션 쿠키 3가지 케이스 확인(유효 시에만 데이터 노출), 구현 중 발견한 RSC 페이로드 데이터 유출 취약점(미인증 상태에서도 `page.tsx`가 데이터를 fetch해 응답 본문에 포함되던 문제)을 `isAdminAuthenticated()` 자체 재검증 가드로 수정
- `[x]` 로그아웃 클릭 시 세션 쿠키가 제거되고 인증 화면으로 복귀하는지 검증 — 사용자가 DevTools Application 탭에서 `admin_session` 쿠키 삭제 확인, 정상
- `[x]` 잘못된 비밀번호 반복 시 rate limit 메시지가 노출되는지 검증 — 사용자가 브라우저에서 직접 확인, 정상

> 참고: 이번 세션에는 Playwright MCP 브라우저 도구가 연결되어 있지 않아 위 항목은 curl 기반 세션 검증(Claude) + 실제 브라우저 수동 확인(사용자)으로 대체 수행함.

---

### Phase 6: 공유 링크 클립보드 복사 — 우선순위 (F008)

> PRD F005는 v1에 "완료"로 기록되었으나 실제 코드에는 복사 버튼이 없고 미리보기 버튼만 존재합니다. 이 Phase에서 **F005를 실질적으로 완성**합니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T601 | 공유 URL 생성 유틸 정리 — `NEXT_PUBLIC_BASE_URL`(폴백 `window.location.origin`) + `/invoices/{공유토큰}` 조합 함수화 | F005, F008 | `[ ]` |
| T602 | 클립보드 복사 버튼 추가 — 목록 각 행에 Copy 버튼 신설, **미리보기 버튼은 유지**(두 버튼 병행). `navigator.clipboard.writeText` 사용 | F005, F008 | `[ ]` |
| T603 | 복사 활성 조건 — 상태가 `승인`이고 공유토큰이 있는 경우에만 활성화(초안/대기/거절은 비활성), 기존 `canCopy` 로직 재사용 | F005, F008 | `[ ]` |
| T604 | 복사 성공 피드백 — 클릭 시 Copy → Check 아이콘/"복사됨" 텍스트로 1.5초 전환 후 원복 (PRD UI/UX 요구사항) | F005, F008 | `[ ]` |
| T605 | 클립보드 실패 폴백 — `navigator.clipboard` 미지원/비보안 컨텍스트(비 HTTPS) 대비 폴백 및 오류 안내 | F008 | `[ ]` |

**Phase 6 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[ ]` `승인` 상태 행에서 복사 버튼이 활성화되고, 그 외 상태에서 비활성인지 검증 (`browser_snapshot`)
- `[ ]` 복사 버튼 클릭 시 클립보드에 **정확한 공개 URL**(`{BASE_URL}/invoices/{토큰}`)이 담기는지 검증 (`browser_click`, `browser_evaluate`로 `navigator.clipboard.readText` 또는 주입 스텁 확인)
- `[ ]` 복사 성공 후 버튼이 "복사됨"/Check로 전환되고 1.5초 뒤 원복되는지 검증 (`browser_click`, `browser_snapshot` 전후 비교)
- `[ ]` 미리보기 버튼이 여전히 새 탭으로 공개 조회 페이지를 여는지 검증 (`browser_click`, `browser_tabs`/`browser_snapshot`)
- `[ ]` 복사된 URL로 이동 시 견적서가 정상 렌더링되는 연계 플로우 검증 (`browser_navigate`, `browser_snapshot`)

---

### Phase 7: 다크모드 커버리지 완성 & 공개 조회 정책 (F009)

> 다크모드 인프라는 이미 완비되어 있으므로 **신규 구축이 아닌 커버리지 점검 + 누락 페이지 정책 결정**입니다. 핵심은 인쇄 요구사항과 충돌하는 공개 조회 페이지의 정책을 확정하는 것입니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T701 | 다크모드 커버리지 감사 — 전 페이지/컴포넌트를 라이트·다크로 순회하며 `dark:` 누락·명암비 문제 목록화 (홈, 공개 조회, 어드민, 404, Header/Footer) | F009 | `[ ]` |
| T702 | **공개 조회 페이지 다크모드 정책 결정** — 화면은 다크 지원, **인쇄 시 무조건 라이트 강제**(`@media print`에서 배경 흰색·폰트 검정 고정)로 확정 후 문서화 | F001, F002, F009 | `[ ]` |
| T703 | 공개 조회 페이지 다크 대응 구현 — `bg-white text-zinc-900` 하드코딩을 다크 대응 클래스로 교체(화면), `print:` 클래스로 인쇄 시 라이트 강제 보장 | F001, F009 | `[ ]` |
| T704 | 누락 컴포넌트 다크 대응 보완 — T701 감사에서 발견된 갭(색상·경계·placeholder 등) 수정 | F009 | `[ ]` |
| T705 | 테마 토글 일관성 점검 — system/light/dark 전환, FOUC 미발생, localStorage 지속성 재확인 | F009 | `[ ]` |

**Phase 7 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[ ]` 다크 모드에서 전 페이지(홈/공개 조회/어드민/404)의 텍스트·배경 명암비가 적절한지 검증 (`browser_click`으로 토글, `browser_snapshot`, 스크린샷 비교)
- `[ ]` 공개 조회 페이지가 다크 모드에서 정상 표시되는지 검증 (`browser_navigate`, `browser_click`(토글), `browser_snapshot`)
- `[ ]` **인쇄 시 다크 모드여도 배경 흰색·폰트 검정으로 강제**되는지 검증 (`browser_emulate_media`(`print`) 또는 `@media print` 시뮬레이션 후 `browser_snapshot`)
- `[ ]` 테마 토글 전환 시 FOUC 없이 즉시 반영되고 새로고침 후에도 유지되는지 검증 (`browser_navigate`, `browser_evaluate`로 `localStorage.theme` 확인, `browser_snapshot`)

---

### Phase 8: 통합 QA 및 배포 (F007~F009)

> v2 3대 기능의 전체 플로우를 통합 검증하고 프로덕션에 반영합니다.

| 태스크 ID | 설명 | 관련 기능 | 상태 |
|-----------|------|-----------|------|
| T801 | E2E 통합 테스트 — 어드민 로그인(세션 유지) → 링크 복사 → 공개 조회 → PDF, 라이트/다크 양쪽에서 검증 | F001~F009 | `[ ]` |
| T802 | 반응형/접근성 재점검 — 어드민 레이아웃·복사 버튼 모바일 뷰포트, 다크 모드 대비 | F004, F008, F009 | `[ ]` |
| T803 | 프로덕션 배포 및 스모크 테스트 — Vercel 반영 후 실 도메인에서 세션·복사·다크모드 재확인 | F007~F009 | `[ ]` |

**Phase 8 테스트 체크리스트 (⚠️ 구현 후 필수 수행 — Playwright MCP)**
- `[ ]` 로그인 → 복사 → (복사 URL로) 공개 조회 → PDF 전체 플로우가 라이트/다크에서 모두 동작하는지 검증 (`browser_navigate`, `browser_fill_form`, `browser_click`, `browser_snapshot`)
- `[ ]` 모바일/데스크톱 뷰포트별 어드민 레이아웃과 복사 버튼 렌더링 검증 (`browser_resize`, `browser_snapshot`)
- `[ ]` 프로덕션(HTTPS)에서 클립보드 복사와 세션 쿠키가 정상 동작하는지 검증 (`browser_navigate`, `browser_network_requests`, `browser_evaluate`)

---

## 현재 진행 상황

### 완료 `[x]` (MVP — v1 아카이브)
- **Phase 0~4 전체** (T001~T405) — Notion 연동, 공개 조회 페이지(F001/F002/F003), 어드민 인증·목록(F004/F006), 인쇄 스타일, Vercel 배포까지 완료. 상세는 `docs/roadmaps/ROADMAP_v1.md` 참조.

### 완료 `[x]` (v2 고도화)
- **Phase 5 (T501~T505)** — 어드민 전용 레이아웃 + 세션 지속 (요구사항 1). `src/lib/session.ts`(HMAC-SHA256 서명 세션 쿠키, `ADMIN_PASSWORD` 재사용), `admin/layout.tsx`(인증 게이트), `AdminLoginForm`/`LogoutButton`/`InvoiceTable` 분리. 구현 중 미인증 상태에서 RSC 페이로드에 견적서 데이터가 유출되던 취약점을 발견·수정(`isAdminAuthenticated()` 자체 재검증 가드).

### 진행 예정 `[ ]` (v2 고도화 — 우선순위 순)
- **Phase 6 (T601~T605)** — 공유 링크 클립보드 복사, F005 실질 완성 (요구사항 2)
- **Phase 7 (T701~T705)** — 다크모드 커버리지 + 공개 조회 페이지 정책 (요구사항 3)
- **Phase 8 (T801~T803)** — 통합 QA 및 배포

### 인계 메모 (v1에서 이월)
- 발행인 정보 환경변수(`NEXT_PUBLIC_ISSUER_NAME/CONTACT/ADDRESS`) 프로덕션 값 미설정 — 현재 placeholder 표시 중. 배포 시 함께 반영 권장.

---

## 백로그: MVP 이후 로드맵 (PRD 명시 — v2 이후 착수)

> 이번 v2(Phase 5~8) 완료 이후 단계적으로 검토합니다. 우선순위는 v2 3대 요구사항보다 낮습니다.

| 항목 | 설명 | 비고 |
|------|------|------|
| NextAuth.js 인증 업그레이드 | 환경변수 비밀번호 → 정식 세션/소셜 로그인. Phase 5의 쿠키 세션을 자연스럽게 대체 가능 | Phase 5 세션 설계와 연계 |
| 발행 상태 제어 UI | 어드민에서 Notion 상태(`대기`/`승인`/`거절`)를 직접 업데이트 | Notion write API 필요 |
| 이메일 자동 발송 | Resend API로 클라이언트에게 공유 링크 자동 전송 | 외부 API 연동 |
| 공유 토큰 자동 생성 | 견적서 생성 시 UUID 토큰 자동 발급 (Notion Automation 또는 별도 API) | |
| 견적서 만료 처리 | 유효기간 경과 시 만료 표시 및 접근 차단 | 공개 조회 가드 확장 |
| 클라이언트 전자 서명 | 견적서 수락/서명 기능 | |

---

## 부록: Notion DB 스키마 (참조)

**Invoices DB** — 견적서번호(Title), 클라이언트명(rich_text), 발행일(Date), 유효기간(Date), 상태(Status: `대기`/`승인`/`거절`), 총금액(Number), 공유토큰(rich_text, UUID), 항목(Relation → Items)

**Items DB** — 항목명(Title), 수량(Number), 단가(Number), 금액(Formula: 수량×단가), Invoices(Relation → Invoices, 영문 속성명)

**환경 변수** — `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_ITEMS_DATABASE_ID`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_ISSUER_NAME/CONTACT/ADDRESS`

> 상세 스키마·internal id는 `docs/PRD.md` 및 `docs/roadmaps/ROADMAP_v1.md` 부록 참조.
