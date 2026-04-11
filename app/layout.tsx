import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/lib/localeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Card Invitation",
  description: "Mobile invitation flow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = cookies().get("NEXT_LOCALE")?.value ?? "ko";
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
