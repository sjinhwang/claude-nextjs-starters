---
name: project-v2-gaps
description: InvoiceHub MVP 이후 v2 고도화 스코프 — F005 복사 미구현 등 v1 기록과 실제 코드의 불일치
metadata:
  type: project
---

InvoiceHub는 MVP(Phase 0~4, T001~T405) 완료 후 v2 고도화 단계에 진입했다. v2 로드맵은 `docs/ROADMAP.md`, MVP 히스토리는 `docs/roadmaps/ROADMAP_v1.md`에 아카이브.

v2 최우선 스코프 3가지(사용자 명시 요청): (1) 어드민 전용 레이아웃 + 세션 지속, (2) 공유 링크 클립보드 복사, (3) 다크모드 커버리지 완성.

**Why:** MVP 사용 중 드러난 관리 UX 갭을 메우기 위함. 특히 v1 로드맵이 "완료"로 기록한 것과 실제 코드 상태가 어긋나는 지점들이 있음.

핵심 불일치/진단(비자명):
- **F005(공유 URL 복사)는 v1에 완료로 기록됐지만 실제 미구현.** `admin/page.tsx`의 마지막 열은 미리보기 버튼(`window.open`)뿐이고 클립보드 복사 버튼이 없음. v2에서 실질 완성 대상.
- 어드민은 `admin/layout.tsx` 없이 단일 `page.tsx`가 `phase` state로 인증/목록을 토글 → 세션 미지속(새로고침 시 인증 풀림).
- 다크모드 인프라(ThemeProvider/ThemeToggle/FOUC 스크립트/Header 토글)는 이미 완비 → 신규 구축 아님. 공개 조회 페이지(`invoices/[token]/page.tsx`)만 `dark:` 누락. 인쇄(A4, 폰트 검정 고정) 요구사항과 충돌하므로 **화면은 다크 지원 + 인쇄는 라이트 강제** 정책으로 결정.

**How to apply:** v2 작업 시 "이미 되어 있는 것"(다크 인프라, 어드민 목록 테이블 UI)을 다시 만들지 말 것. 실제 갭(복사 버튼, 세션, 공개 조회 다크 대응)에 집중. Notion 상태값은 `대기`/`승인`/`거절`이며 공개 조회·복사 활성은 `승인`만 해당.
