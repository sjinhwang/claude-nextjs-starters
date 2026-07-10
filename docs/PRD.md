# Notion 기반 견적서 공유 서비스 MVP PRD

## 핵심 정보

**목적**: 사업자가 Notion에 입력한 견적서를 클라이언트가 전용 URL로 조회하고 PDF로 저장할 수 있게 한다.
**사용자**: 프리랜서·1인 사업자(견적서 작성자)와 그들의 클라이언트(견적서 수신자)

---

## 사용자 여정

```
[사업자] Notion DB에 견적서 행 입력
         ↓ 공유 토큰(UUID) 속성 작성 또는 자동 부여
[어드민 견적서 목록 페이지] 접속
         ↓ Notion DB 조회 → 견적서 목록 렌더링
[공유 URL 복사] 클립보드에 복사
         ↓ 이메일·메신저 등으로 클라이언트에게 전달
[클라이언트] 공유 URL 클릭
         ↓ 공유 토큰으로 Notion API 조회
[견적서 공개 조회 페이지] 견적서 내용 표시
         ↓ 클라이언트 선택
   [PDF 저장] window.print() 실행
```

---

## 기능 명세

### 1. MVP 핵심 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|--------------|------------|
| **F001** | 견적서 웹 조회 | 공유 토큰 기반 URL로 Notion DB 견적서 데이터를 렌더링 — **상태가 `발행`인 경우에만 표시, `초안`은 404 반환** | 서비스의 핵심 전달 가치 | 견적서 공개 조회 페이지 |
| **F002** | PDF 다운로드 | `window.print()` + `@media print` CSS로 견적서를 PDF 저장 | 클라이언트가 견적서 보관·서명하기 위한 필수 기능 | 견적서 공개 조회 페이지 |
| **F003** | Notion 데이터 연동 | `@notionhq/client`로 Notion API 호출, 견적서 속성과 페이지 블록(품목 테이블)을 파싱 | Notion이 유일한 데이터 소스 | 견적서 공개 조회 페이지, 어드민 견적서 목록 페이지 |
| **F004** | 견적서 목록 조회 | 어드민이 Notion DB 전체 견적서 목록을 확인 (번호, 클라이언트명, 상태, 날짜) | 사업자가 발행 현황을 파악하고 URL을 공유하기 위한 관리 뷰 | 어드민 견적서 목록 페이지 |
| **F005** | 공유 URL 복사 | 견적서별 공개 URL을 클립보드에 복사 | URL 직접 접근 방식에서 공유 수단은 클립보드 복사가 유일 | 어드민 견적서 목록 페이지 |
| **F006** | 어드민 기본 인증 | 환경변수(`ADMIN_PASSWORD`) 기반 비밀번호로 어드민 페이지 접근 제어 — 불일치 시 401 반환 | 어드민 URL이 노출되어도 견적서 목록이 외부에 유출되지 않도록 최소한의 보호 필요 | 어드민 견적서 목록 페이지 |

### 2. MVP 이후 기능 (제외)

- 견적서 상태 변경 UI (어드민 웹에서 Notion 상태 수정)
- 이메일 자동 발송
- 클라이언트 서명·승인 기능
- 견적서 유효기간 만료 처리
- 다국어 지원

---

## 메뉴 구조

```
공개 접근 (인증 불필요)
└── 견적서 공개 조회
    └── 기능: F001 (Notion 데이터 렌더링 — 발행 상태만), F002 (PDF 다운로드), F003 (Notion 연동)

어드민 내부 페이지 (비밀번호 인증 필요)
└── 어드민 견적서 목록
    └── 기능: F006 (어드민 인증), F003 (Notion 연동), F004 (목록 조회), F005 (URL 복사)
```

---

## 페이지별 상세 기능

### 견적서 공개 조회 페이지

> **구현 기능:** `F001`, `F002`, `F003` | **접근:** 공유 토큰 포함 URL로 직접 진입

| 항목 | 내용 |
|------|------|
| **역할** | 클라이언트가 견적서 내용을 확인하고 PDF로 저장하는 공개 페이지 |
| **진입 경로** | 사업자로부터 전달받은 공유 URL 클릭 (토큰 없거나 Notion 미매칭 시 404) |
| **사용자 행동** | 견적서 내용 열람 → PDF 저장 버튼 클릭 → 브라우저 인쇄 다이얼로그에서 PDF로 저장 |
| **주요 기능** | • 공유 토큰으로 Notion API 호출 — 견적서 속성 + 품목 테이블 블록 파싱<br>• **상태 검증: `발행` 상태인 경우에만 내용 렌더링 — `초안` 상태이면 토큰이 유효해도 404 반환**<br>• 발행인 정보 (회사명, 연락처, 주소) 표시<br>• 수신인 정보 (클라이언트명) 표시<br>• 품목 목록 테이블 (품목명, 수량, 단가, 금액) 표시<br>• 공급가액·부가세·합계 계산 표시<br>• 견적 유효기간 표시<br>• `@media print` CSS로 인쇄 전용 레이아웃 전환<br>• **PDF로 저장** 버튼 (`window.print()` 호출) |
| **다음 이동** | PDF 저장 완료 → 같은 페이지 유지 / 토큰 미매칭 또는 초안 상태 → 404 페이지 |

---

### 어드민 견적서 목록 페이지

> **구현 기능:** `F006`, `F003`, `F004`, `F005` | **접근:** 어드민 전용 URL — 비밀번호 인증 후 진입

| 항목 | 내용 |
|------|------|
| **역할** | 사업자가 Notion DB의 견적서 목록을 확인하고 클라이언트 공유 URL을 복사하는 내부 관리 페이지 |
| **진입 경로** | 사업자가 브라우저에서 어드민 URL 직접 입력 → 비밀번호 입력 후 진입 (환경변수 `ADMIN_PASSWORD`와 비교, 불일치 시 401) |
| **사용자 행동** | 견적서 목록 확인 → 공유할 견적서의 URL 복사 버튼 클릭 → 클라이언트에게 전달 |
| **주요 기능** | • **비밀번호 인증 폼** — 미인증 상태에서 어드민 URL 접근 시 비밀번호 입력 화면 표시, 환경변수 `ADMIN_PASSWORD`와 비교<br>• Notion DB 전체 조회 — 견적서 번호, 클라이언트명, 견적 날짜, 상태(초안/발행) 표시<br>• 상태별 뱃지 표시 (초안: 회색, 발행: 초록)<br>• **URL 복사** 버튼은 상태가 `발행`인 견적서에만 활성화 (초안은 버튼 비활성 또는 미표시)<br>• 복사 성공 시 버튼 텍스트 피드백 ("복사됨")<br>• 최신순 정렬<br>• **새로고침** 버튼 (Notion DB 최신 데이터 재조회) |
| **다음 이동** | URL 복사 완료 → 같은 페이지 유지 |

---

## Notion 데이터베이스 스키마

두 개의 Notion 데이터베이스를 사용한다. 품목 데이터는 페이지 본문 블록이 아닌 별도 `Items` DB로 관리한다.

> **실제 Notion DB 기준으로 작성** — API 조회 결과를 반영함.

### DB 1: Invoices (견적서)

**DB ID:** `38fc1f36-208d-804c-954a-dd9cda2b9bf6`

> **API 접근 방식**: `page.properties`의 키는 obfuscated ID가 아닌 **속성 display name** (한국어 그대로) 사용.
> 괄호 안의 internal id는 참고용 — 필터 조건에서 property name 대신 사용 가능하나 display name 권장.

| 속성명 | Notion 타입 | internal id | 설명 |
|--------|------------|-------------|------|
| 견적서번호 | Title | `title` | 예: `INV-2026-06-001` — 고유 식별 번호 |
| 클라이언트명 | Text (rich_text) | `Pdyc` | 수신 클라이언트 또는 회사명 |
| 발행일 | Date | `bF{c` | 견적서 발행일 |
| 유효기간 | Date | `MBq]` | 견적 유효 만료일 |
| 상태 | Status | `puDX` | `대기` / `거절` / `승인` |
| 총금액 | Number (원) | `mm;K` | 견적 총액 (수동 입력 또는 Items 롤업) |
| 항목 | Relation → Items DB | `nTGV` | 해당 견적서에 속한 품목 행들 (양방향) |
| 공유토큰 | Text (rich_text) | `oRk]` | UUID v4 — 공개 URL 식별자 |

> ✅ **`상태` 옵션 확인 완료** — `대기` / `거절` / `승인` (코드 InvoiceStatus와 일치)

### DB 2: Items (품목)

**DB ID:** `38fc1f36-208d-80eb-8bf8-fe2fa2940bdc`

| 속성명 | Notion 타입 | internal id | 설명 |
|--------|------------|-------------|------|
| 항목명 | Title | `title` | 서비스/상품명 — 예: `웹 퍼블리싱` |
| 수량 | Number (숫자) | `P<JA` | 정수 |
| 단가 | Number (원) | `Xu@T` | 원화 정수 |
| 금액 | Formula | `JoGO` | `수량 * 단가` — 자동 계산 |
| Invoices | Relation → Invoices DB | `qkUu` | 소속 견적서 연결 (양방향, synced) — 영문 속성명 |

**관계:** `Items.Invoices` ↔ `Invoices.항목` (양방향 dual_property 설정 완료)

---

## 기술 아키텍처

```
[Notion 데이터베이스]
        ↓ @notionhq/client (서버 사이드)
[Next.js 16 App Router]
  ├── Server Component: Notion API 호출 (API Key 노출 없음)
  ├── 공개 조회 페이지: /invoices/[token] → 공유 토큰으로 DB 필터링 후 페이지 조회
  └── 어드민 목록 페이지: /admin → 전체 DB 조회
        ↓ 렌더링 결과
[클라이언트 브라우저]
  └── window.print() → PDF 저장
```

**핵심 결정:**
- Notion API 호출은 Server Component에서만 수행 (API Key가 클라이언트에 노출되지 않음)
- 공개 URL 형식: `/invoices/[token]` — `token`은 Notion DB의 `공유토큰` 속성값(UUID)
- Notion API는 `공유토큰` 속성으로 견적서 DB를 필터링하여 page_id 획득 → 품목 DB를 Relation으로 필터링하여 품목 목록 조회 (블록 파싱 불필요)
- 품목 데이터는 페이지 본문 블록이 아닌 별도 `품목 (Items)` DB로 관리 — `databases.query()`로 단순 조회
- PDF: 외부 라이브러리 없이 `window.print()` + `@media print` CSS 활용
- ISR(Incremental Static Regeneration) 미적용 — Server Component 기본 캐시 활용 (`cache: 'no-store'`로 최신 데이터 보장)

---

## 데이터 흐름 (공개 조회)

```
1. 클라이언트 → /invoices/[token] 접속
2. Next.js Server Component → Invoices DB 조회
   databases.query(NOTION_DATABASE_ID, { filter: { property: "공유토큰", rich_text: { equals: token } } })
3. 결과 page_id 및 견적서 속성 획득
4. 상태 확인 → `승인` 이외의 상태(`대기`/`거절`)이면 notFound() 호출 (404 반환)
5. Items DB 조회
   databases.query(NOTION_ITEMS_DATABASE_ID, { filter: { property: "Invoices", relation: { contains: page_id } } })
6. 품목 목록 (항목명·수량·단가·금액) 획득 → 공급가액·부가세·합계 계산
7. 렌더링 완료 → HTML 반환
8. 클라이언트에서 PDF 버튼 클릭 → window.print()
```

---

## UI/UX 요구사항

### 견적서 공개 조회 페이지

- A4 비율 레이아웃 (794px 너비 기준) — 인쇄 시 A4 용지에 맞게 출력
- 한국어 금액 표기: `Intl.NumberFormat('ko-KR')` (쉼표 천 단위 구분, 원화 기호)
- 한국 날짜 표기: `YYYY년 MM월 DD일`
- 인쇄 전용 스타일 (`@media print`):
  - PDF 저장 버튼 숨김
  - 헤더/푸터 숨김
  - 여백 및 페이지 나누기 제어
  - 폰트 검정색 고정
- 로딩 중: 스켈레톤 UI 표시
- 잘못된 토큰: "견적서를 찾을 수 없습니다" 안내 (404 처리)

### 어드민 견적서 목록 페이지

- 심플한 테이블 레이아웃 — 별도 디자인 공수 최소화
- 상태 뱃지: shadcn/ui `Badge` 컴포넌트 활용
- URL 복사 버튼: 복사 성공 시 체크 아이콘으로 1.5초 전환 후 원복

---

## 환경 변수

```env
NOTION_API_KEY=secret_xxx               # Notion Integration API Key
NOTION_DATABASE_ID=xxx                  # 견적서 (Invoices) DB ID
NOTION_ITEMS_DATABASE_ID=xxx            # 품목 (Items) DB ID
NEXT_PUBLIC_BASE_URL=https://...        # 공개 URL 생성용 도메인
ADMIN_PASSWORD=your_secret_password     # 어드민 페이지 접근 비밀번호 (F006)
```

---

## 데이터 모델 요약

### Invoice (Invoices DB Row — 실제 스키마 기준)

| 필드 (속성명) | Notion 타입 | 설명 |
|--------------|------------|------|
| id | — | Notion 페이지 ID (내부용) |
| 견적서번호 | Title | INV-YYYY-MM-NNN 형식 |
| 클라이언트명 | rich_text | 수신자명 |
| 발행일 | date | 견적서 발행일 |
| 유효기간 | date | 견적 유효 만료일 |
| 상태 | status | `대기` / `거절` / `승인` |
| 총금액 | number (원) | 견적 총액 |
| 항목 | relation | Items DB 연결 |
| 공유토큰 | rich_text | UUID v4 — 공개 URL 식별자 |

### InvoiceItem (Items DB Row — 실제 스키마 기준)

| 필드 (속성명) | Notion 타입 | 설명 |
|--------------|------------|------|
| id | — | Notion 페이지 ID (내부용) |
| 항목명 | title | 서비스/상품명 |
| 수량 | number | 정수 |
| 단가 | number (원) | 원화 정수 |
| 금액 | formula | 수량 × 단가 (Notion 자동 계산) |
| Invoices | relation | 소속 견적서 page_id 연결 |

---

## 기술 스택

### 프론트엔드 프레임워크

- **Next.js 16.2.9** (App Router, Turbopack) — Server Component에서 Notion API 호출
- **React 19.2.4** — UI 라이브러리
- **TypeScript 5** (strict mode) — 타입 안전성

### 스타일링 & UI

- **TailwindCSS v4** (`@theme` 블록 방식, `tailwind.config.ts` 없음)
- **shadcn/ui** (radix-nova 스타일) — Badge, Button, Table 컴포넌트
- **lucide-react** — 아이콘 (Copy, Check, Download 등)

### Notion 연동

- **@notionhq/client** — Notion 공식 Node.js SDK (서버 사이드 전용)

### PDF 생성

- **window.print()** + **@media print CSS** — 외부 라이브러리 없이 브라우저 기본 기능 활용

### 배포

- **Vercel** — Next.js 16 최적화 배포, 환경 변수 관리

### 패키지 관리

- **npm** — 의존성 관리

---

## MVP 이후 로드맵

| 기능 | 설명 |
|------|------|
| NextAuth.js 인증 | MVP의 환경변수 비밀번호 방식을 NextAuth.js 기반 로그인으로 업그레이드 |
| 발행 상태 제어 | 어드민 UI에서 Notion 상태 속성 직접 업데이트 |
| 이메일 발송 | Resend API 연동 — 클라이언트에게 URL 자동 발송 |
| 공유 토큰 자동 생성 | 견적서 생성 시 UUID 자동 주입 (Notion Automation 또는 별도 API) |
| 견적서 만료 처리 | 유효기간 초과 시 조회 차단 |
| 클라이언트 서명 | 전자 서명 수락/거절 기능 |

---

## Notion 설정 가이드 (개발 참고)

**현재 완료된 항목:**
- [x] Invoices DB 생성 (ID: `38fc1f36-208d-804c-954a-dd9cda2b9bf6`)
- [x] Items DB 생성 (ID: `38fc1f36-208d-80eb-8bf8-fe2fa2940bdc`)
- [x] 양방향 Relation 연결 (`Invoices.항목` ↔ `Items.Invoices`)
- [x] Integration 연결 및 API Key 설정
- [x] 환경변수 `.env.local` 설정 완료

**아직 해야 할 항목:**
- [x] Invoices DB에 `공유토큰` 속성 추가 (Text 타입) — 완료 (internal id: `oRk]`)
- [x] 상태 옵션 확인: `대기`/`거절`/`승인` — 코드 InvoiceStatus와 일치 확인 완료
- [x] 테스트용 견적서 `공유토큰`에 UUID 입력 완료 (`49d7cdb5-9ca6-4fb3-8789-7d0c991580bd`)
