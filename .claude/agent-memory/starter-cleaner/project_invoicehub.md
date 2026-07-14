---
name: project-invoicehub-context
description: InvoiceHub 프로젝트 초기화 완료 상태 및 목표 라우트 구조
metadata:
  type: project
---

InvoiceHub는 Notion API를 CMS/DB로 활용한 견적서 생성·관리·공유 MVP입니다. 스타터킷 초기화를 완료하여 데모 코드를 제거하고 프로젝트에 맞는 구조로 전환했습니다.

**목표 라우트 구조:**
- `/` — 홈 (견적서 앱 진입점, 완료)
- `/invoices` — 견적서 목록 (구현 예정)
- `/invoices/new` — 새 견적서 작성 (구현 예정)
- `/invoices/[token]` — 견적서 공개 조회 F001/F002/F003 (구현 예정)
- `/admin` — 어드민 견적서 목록 F004/F005/F006 (구현 예정)

**제거된 파일:** about/, docs/, examples/ (app), api/hello/, components/examples/, CodeBlock.tsx

**Why:** MVP 초기화 단계로 데모 보일러플레이트를 제거하고 실 개발 기반 마련.
**How to apply:** 새 라우트 추가 시 위 목표 구조를 기준으로 파일 경로 결정.
