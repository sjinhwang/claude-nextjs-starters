import { ImageResponse } from "next/og";

/**
 * T1105: 공유 링크 미리보기(OG 카드)용 이미지.
 * 실제 브랜드 자산이 없어 견적서 데이터에 의존하지 않는 고정 placeholder로 최소 구현한다
 * (승인/비승인 모든 경로에서 동일하게 안전히 재사용 — 민감정보 노출 위험 자체가 없음).
 * 브랜드 자산이 준비되면 이 파일을 정적 PNG(opengraph-image.png)로 교체하는 것을 권장한다.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>InvoiceHub</div>
        <div style={{ marginTop: 16, fontSize: 36, color: "#a1a1aa" }}>
          견적서 공개 조회
        </div>
      </div>
    ),
    { ...size },
  );
}
