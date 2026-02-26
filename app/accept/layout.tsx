import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "초대장 도착",
  description: "비밀 초대장이 도착했습니다. 수락 페이지를 열어보세요.",
  openGraph: {
    title: "초대장이 도착했습니다 💌",
    description: "초대장을 수락하고 내용을 확인해 보세요.",
    type: "website",
    images: [
      {
        url: "https://card-invitation.duckdns.org/accept-og-v2.jpg",
        width: 1200,
        height: 630,
        alt: "초대장 도착 미리보기 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "초대장이 도착했습니다 💌",
    description: "초대장을 수락하고 내용을 확인해 보세요.",
    images: ["https://card-invitation.duckdns.org/accept-og-v2.jpg"],
  },
};

export default function AcceptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
