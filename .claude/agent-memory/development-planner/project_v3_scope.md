---
name: project-v3-scope
description: InvoiceHub v3 고도화 스코프 — 목록 고급조회(F010)·고유링크(F011)·공유통합(F012), 통계는 결정 필요
metadata:
  type: project
---

InvoiceHub는 MVP(Phase 0~4)와 v2(Phase 5~8) 완료 후 v3 고도화에 진입했다. v3 로드맵은 `docs/ROADMAP.md`, 이전 히스토리는 `docs/roadmaps/ROADMAP_v1.md`(F001~F006)·`ROADMAP_v2.md`(F007~F009)에 아카이브. 관련: [[project-v2-gaps]].

v3 스코프 3가지(사용자 명시): (1) 목록 고급 조회 = F010(검색·상태필터·날짜필터·정렬·페이지네이션·하이라이팅), (2) 고유 링크 생성·표시 = F011(링크 컬럼 필수 + 짧은URL·QR 선택) **최우선**, (3) 링크 공유 통합 = F012(mailto·메신저·OG 메타데이터). Phase 9~12, 태스크 T901~T1203.

**Why:** 견적서 건수 증가로 드러난 목록 탐색 한계 + 클립보드 복사에 머문 공유 수단 확장. 사용자는 F011을 우선순위로 지정했으나, 링크 컬럼이 목록 테이블(F010) 위에 얹히므로 Phase 9(F010)→10(F011) 연속 우선 트랙으로 설계.

착수 전 결정 필요(로드맵에 태스크 아닌 "결정 필요 항목"으로 분리):
- **D1 링크 통계/조회수**: Notion 스키마에 카운터 필드 없음. 대안 (a)Notion 속성 증분(레이스/쿼터) (b)Vercel KV/Upstash(신규 의존성) (c)외부 애널리틱스. 새 백엔드 도입은 미확정.
- **D2 짧은 URL**·**D3 QR**·**D4 카카오 SDK**: 신규 의존성/저장소라 선택 확장으로 분리.

비자명 코드 진단(v3 착수 시 참고):
- `src/app/admin/InvoiceTable.tsx`는 `getAllInvoices()` 결과를 전량 렌더 — 검색/필터/정렬/페이지네이션 UI 전무. F010은 클라이언트 측 뷰 가공으로 구현(목록 규모 작음).
- `src/lib/invoice-url.ts`의 `buildInvoiceShareUrl(token)` 존재 → 링크 컬럼/공유는 이 위에 확장.
- OG 메타데이터: 루트 `layout.tsx`에 정적 OG만. `invoices/[token]/page.tsx`에 `generateMetadata` 없음 → F012에서 신설(비승인 토큰 민감정보 노출 방지 폴백 필수).

**How to apply:** v3 작업 시 이미 있는 것(복사/미리보기 버튼, invoice-url 유틸, 다크 인프라)을 다시 만들지 말 것. 통계/짧은URL/QR은 결정 없이 태스크 확정 금지.
