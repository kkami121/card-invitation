import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #f8f2e8 0%, #efe3cf 100%)",
          color: "#2f2a24",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, lineHeight: 1, marginBottom: 26 }}>💌</div>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1, marginBottom: 14 }}>초대장이 도착했습니다</div>
        <div style={{ fontSize: 36, color: "#5f564a" }}>수락 페이지를 열어 확인해 보세요</div>
      </div>
    ),
    {
      ...size,
    },
  );
}

