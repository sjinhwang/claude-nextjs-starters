---
name: project-invoice-web
description: invoice-web 프로젝트의 목적, 핵심 기능, PRD 결정사항 요약 (Notion 연동 기반)
metadata:
  type: project
---

invoice-web은 사업자가 Notion DB에 입력한 견적서를 클라이언트가 고유 URL로 웹 조회하고 PDF로 다운로드할 수 있는 서비스다.

**Why:** Notion을 이미 사용하는 1인 사업자가 별도 소프트웨어 없이 견적서를 작성·공유할 수 있는 최소 도구가 필요해서.

**How to apply:** 기능 추가 제안 시 MVP 5개 기능(F001~F005) 범위 기준으로 판단. Notion이 유일한 데이터 소스이므로 별도 DB(Supabase 등)는 MVP에서 제외됨.

## PRD 핵심 결정사항

- **데이터 소스**: Notion DB — 사업자가 Notion에서 직접 견적서 입력
- **Notion 연동**: `@notionhq/client` SDK, Server Component에서만 호출 (API Key 보호)
- **PDF 생성 방식**: 외부 라이브러리 없이 `window.print()` + `@media print` CSS 활용
- **공유 방식**: Notion DB의 `공유토큰` 속성(UUID)을 URL 식별자로 사용 (`/invoices/[token]`)
- **인증 없음**: 어드민 페이지도 별도 인증 없이 비공개 URL로 접근
- **품목 데이터**: Notion 페이지 내 테이블 블록으로 관리, Next.js에서 블록 파싱
- **한국어 지원**: `Intl.NumberFormat('ko-KR')` 원화, 한국 날짜 형식

## 페이지 목록 (총 2개)

1. 견적서 공개 조회 페이지 (F001, F002, F003) — 클라이언트 접근, 웹 조회 + PDF 저장
2. 어드민 견적서 목록 페이지 (F003, F004, F005) — 사업자 내부용, 목록 조회 + URL 복사

## 기능 목록 (총 5개)

- F001: 견적서 웹 조회 — 공유 토큰 기반 URL로 Notion 데이터 렌더링
- F002: PDF 다운로드 — window.print() + @media print CSS
- F003: Notion 데이터 연동 — Notion API로 속성 + 품목 테이블 블록 파싱
- F004: 견적서 목록 조회 — 어드민이 Notion DB 전체 목록 확인
- F005: 공유 URL 복사 — 클립보드 API로 공유 토큰 포함 URL 복사

## Notion DB 스키마

속성: 견적서번호(Title), 클라이언트명(Text), 클라이언트이메일(Email), 견적일(Date), 유효기간(Date), 상태(Select: 초안/발행), 공유토큰(Text: UUID), 메모(Text)
페이지 내 블록: 품목 테이블 (품목명 | 수량 | 단가 | 금액)

## 기술 스택 (프로젝트 기준)

Next.js 16.2.9 + React 19.2.4 + TypeScript 5 + TailwindCSS v4 + shadcn/ui + @notionhq/client
PDF는 window.print() (외부 라이브러리 없음)
