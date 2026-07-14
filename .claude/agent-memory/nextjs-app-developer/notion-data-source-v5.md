---
name: notion-data-source-v5
description: "@notionhq/client v5의 data_source_id 조회 방식 및 InvoiceHub의 database_id -> data_source_id 메모이즈 패턴"
metadata:
  type: project
---

InvoiceHub는 Notion API 2025-09-03 (`@notionhq/client` v5)를 사용합니다. v5부터 하나의 database는 1개 이상의 data source를 가지며, `notion.databases.query`는 **제거**되었고 `notion.dataSources.query({ data_source_id })`로 조회해야 합니다.

`src/lib/notion.ts`의 `resolveDataSourceId(databaseId)`가 `database_id -> data_source_id` 변환을 모듈 스코프 `Map`에 메모이즈합니다 (매 요청마다 `databases.retrieve` 추가 호출 방지).

**Why:** v5 SDK breaking change. 학습 데이터 기준 코드(`databases.query`)를 쓰면 즉시 런타임 에러 발생.

**How to apply:** Notion DB 조회 코드를 새로 작성할 때는 반드시 `dataSources.query` + `data_source_id`를 사용할 것. `database_id`를 직접 필터/쿼리에 넘기지 말 것.

DB 2개: `NOTION_DATABASE_ID`(Invoices), `NOTION_ITEMS_DATABASE_ID`(Items, 품목).

관련: [[project-invoice-types]]
