# InvoiceHub

Notion API를 CMS/DB로 활용하여 견적서를 생성·관리·공유하는 MVP 웹 서비스입니다.

## 프로젝트 개요

**목적**: 사업자가 Notion에 입력한 견적서를 클라이언트가 전용 URL로 조회하고 PDF로 저장할 수 있게 한다.
**사용자**: 프리랜서·1인 사업자(견적서 작성자)와 그들의 클라이언트(견적서 수신자)

## 주요 페이지

| 경로 | 설명 | 접근 |
|------|------|------|
| `/invoices/[token]` | 견적서 공개 조회 — 공유 토큰 기반 Notion 데이터 렌더링 및 PDF 다운로드 | 공개 |
| `/admin` | 어드민 견적서 목록 — Notion DB 전체 조회, 공유 URL 복사 | 비밀번호 인증 |

## 핵심 기능

- **F001 견적서 웹 조회**: 공유 토큰 URL로 Notion DB 데이터 렌더링 (발행 상태만 허용, 초안은 404)
- **F002 PDF 다운로드**: `window.print()` + `@media print` CSS로 브라우저 인쇄 다이얼로그 활용
- **F003 Notion 데이터 연동**: `@notionhq/client`로 견적서 속성 + 품목 테이블 블록 파싱
- **F004 견적서 목록 조회**: 어드민이 Notion DB 전체 견적서 확인 (번호, 클라이언트명, 상태, 날짜)
- **F005 공유 URL 복사**: 견적서별 공개 URL 클립보드 복사
- **F006 어드민 기본 인증**: 환경변수 `ADMIN_PASSWORD` 기반 비밀번호 접근 제어

## 기술 스택

- **Framework**: Next.js 16.2.9 (App Router, Turbopack)
- **Runtime**: React 19.2.4
- **Language**: TypeScript 5 (strict mode)
- **Styling**: TailwindCSS v4 (`@theme` 블록 방식)
- **UI Components**: shadcn/ui (radix-nova 스타일)
- **Icons**: lucide-react
- **Notion 연동**: @notionhq/client (서버 사이드 전용)
- **배포**: Vercel

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxx
NEXT_PUBLIC_BASE_URL=http://localhost:3002
ADMIN_PASSWORD=your_password

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

개발 서버: http://localhost:3002

## 개발 상태

- 기본 프로젝트 구조 설정 완료
- Notion API 연동 구현 예정
- 견적서 공개 조회 페이지 구현 예정
- 어드민 견적서 목록 페이지 구현 예정
- PDF 다운로드 기능 구현 예정

## 문서

- [PRD 문서](./docs/PRD.md) — 상세 요구사항 및 기능 명세
- [개발 가이드](./CLAUDE.md) — 개발 지침 및 코드 패턴
