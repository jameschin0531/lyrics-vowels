import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyrics → Vowels",
  description: "Convert Chinese lyrics to their main vowel sounds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
