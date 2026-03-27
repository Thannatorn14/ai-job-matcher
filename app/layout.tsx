import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Matcher – Find Jobs That Match Your Resume",
  description:
    "Upload your resume and let Claude AI search real-time job listings across the web to find the best matches for your skills and experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
