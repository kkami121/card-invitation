/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone 모드: 실행에 필요한 파일만 포함 → Docker 이미지 크기 대폭 감소
  output: "standalone",

  async headers() {
    return [
      {
        // 콘텐츠 해시가 포함된 Next.js 정적 자산은 영구 캐시
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // 테마 이미지는 거의 바뀌지 않으므로 30일 캐시
        source: "/theme-images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        // 사용자 업로드 이미지는 캐시 금지
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
