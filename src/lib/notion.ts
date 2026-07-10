import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { logger } from "@/lib/logger";
import type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  NotionInvoiceProperties,
  NotionInvoiceItemProperties,
} from "@/types/invoice";

/**
 * Notion API 반복 호출을 줄이기 위한 데이터 캐시 유지 시간(초).
 * `invoices/[token]/page.tsx`의 `dynamic = "force-dynamic"`은 라우트(Full Route Cache)
 * 캐싱을 끄는 것일 뿐, 아래 unstable_cache로 감싼 데이터 fetch 자체는 독립적으로 60초간 캐싱된다.
 * 즉 라우트는 매 요청 렌더링되지만, 그 안에서 호출하는 Notion 조회 결과는 60초 이내 재사용된다.
 */
const NOTION_CACHE_REVALIDATE_SECONDS = 60;
const NOTION_CACHE_TAG = "invoices";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 견적서(Invoices) / 품목(Items) 데이터베이스 ID — 서버 사이드 전용 환경변수
const INVOICES_DB = process.env.NOTION_DATABASE_ID!;
const ITEMS_DB = process.env.NOTION_ITEMS_DATABASE_ID!;

type RawPage = { id: string; properties: unknown };

/**
 * Notion API 2025-09-03 (@notionhq/client v5)부터 하나의 database는
 * 1개 이상의 data source를 가지며, DB 조회는 database_id가 아닌
 * data_source_id로 수행한다 (`notion.dataSources.query`).
 * `notion.databases.query`는 v5에서 제거되었다.
 *
 * database_id → data_source_id 변환 결과를 모듈 스코프에 메모이즈하여
 * 매 요청마다 databases.retrieve 호출(추가 API 요청)이 발생하지 않도록 한다.
 */
const dataSourceCache = new Map<string, string>();

async function resolveDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceCache.get(databaseId);
  if (cached) return cached;

  const db = await notion.databases.retrieve({ database_id: databaseId });
  // GetDatabaseResponse는 Partial | Full 유니온 → data_sources 접근 전 내로잉
  const dataSourceId =
    "data_sources" in db ? db.data_sources[0]?.id : undefined;
  if (!dataSourceId) {
    throw new Error(`데이터베이스에 data source가 없습니다: ${databaseId}`);
  }
  dataSourceCache.set(databaseId, dataSourceId);
  return dataSourceId;
}

function parseInvoice(page: RawPage): Omit<Invoice, "항목"> {
  const p = page.properties as NotionInvoiceProperties;
  return {
    id: page.id,
    견적서번호: p.견적서번호.title[0]?.plain_text ?? "",
    클라이언트명: p.클라이언트명.rich_text[0]?.plain_text ?? "",
    발행일: p.발행일.date?.start ?? null,
    유효기간: p.유효기간.date?.start ?? null,
    상태: (p.상태.status?.name ?? "대기") as InvoiceStatus,
    총금액: p.총금액.number,
    공유토큰: p.공유토큰.rich_text[0]?.plain_text ?? "",
  };
}

function parseItem(page: RawPage): InvoiceItem {
  const p = page.properties as NotionInvoiceItemProperties;
  return {
    id: page.id,
    항목명: p.항목명.title[0]?.plain_text ?? "",
    수량: p.수량.number,
    단가: p.단가.number,
    금액: p.금액.formula.number,
  };
}

/**
 * 공유토큰으로 견적서 1건을 조회한다. (F001 공개 조회)
 * 토큰 미매칭 또는 Notion API 오류 시 null 반환 → 호출부에서 notFound()(404) 처리.
 */
async function fetchInvoiceByToken(token: string): Promise<Invoice | null> {
  try {
    const dataSourceId = await resolveDataSourceId(INVOICES_DB);
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "공유토큰", rich_text: { equals: token } },
    });

    const page = res.results[0];
    if (!page || !("properties" in page)) return null;

    const base = parseInvoice(page as RawPage);
    const items = await getInvoiceItems(page.id);
    return { ...base, 항목: items };
  } catch (error) {
    // 잘못된 토큰/네트워크/권한 오류 등은 404로 귀결시키기 위해 null 반환
    logger.error("getInvoiceByToken", "Notion 조회 실패", error);
    return null;
  }
}

/**
 * 특정 견적서 page_id에 연결된 품목 목록을 Items DB에서 직접 조회한다.
 * relation 속성(최대 25개)을 파싱하지 않고 Items DB를 relation 필터로 조회하므로
 * 25개 초과 relation 절단 문제를 우회한다. (품목 100개 초과 시 페이지네이션 필요 — MVP 범위 외)
 */
async function fetchInvoiceItems(invoicePageId: string): Promise<InvoiceItem[]> {
  const dataSourceId = await resolveDataSourceId(ITEMS_DB);
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "Invoices", relation: { contains: invoicePageId } },
  });
  return res.results
    .filter((p) => "properties" in p)
    .map((p) => parseItem(p as RawPage));
}

/**
 * 전체 견적서 목록을 발행일 내림차순(최신순)으로 조회한다. (F004 어드민 목록)
 */
async function fetchAllInvoices(): Promise<Omit<Invoice, "항목">[]> {
  const dataSourceId = await resolveDataSourceId(INVOICES_DB);
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "발행일", direction: "descending" }],
  });
  return res.results
    .filter((p) => "properties" in p)
    .map((p) => parseInvoice(p as RawPage));
}

// ─── 캐싱된 export ──────────────────────────────────────────────────────────
// 위 fetch* 함수들을 unstable_cache로 감싸 60초간 Notion API 응답을 재사용한다.
// (동일 인자 호출에 대해서만 캐시가 적용되며, 인자는 자동으로 캐시 키에 포함된다.)

export const getInvoiceByToken = unstable_cache(
  fetchInvoiceByToken,
  ["notion-invoice-by-token"],
  { revalidate: NOTION_CACHE_REVALIDATE_SECONDS, tags: [NOTION_CACHE_TAG] },
);

export const getInvoiceItems = unstable_cache(
  fetchInvoiceItems,
  ["notion-invoice-items"],
  { revalidate: NOTION_CACHE_REVALIDATE_SECONDS, tags: [NOTION_CACHE_TAG] },
);

export const getAllInvoices = unstable_cache(
  fetchAllInvoices,
  ["notion-all-invoices"],
  { revalidate: NOTION_CACHE_REVALIDATE_SECONDS, tags: [NOTION_CACHE_TAG] },
);
