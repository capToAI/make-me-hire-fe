import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakeMeHire — Free Live Resume Builder & PDF Generator",
  description:
    "Build, customize, and export professional, ATS-friendly resumes in real-time. Features live responsive preview, drag-and-drop section reordering, Letter & A4 pagination, and instant PDF export.",
  keywords: [
    "resume builder",
    "free resume maker",
    "live resume editor",
    "ATS resume builder",
    "CV maker",
    "PDF resume generator",
    "professional resume templates",
  ],
  authors: [{ name: "MakeMeHire" }],
  creator: "MakeMeHire",
  openGraph: {
    title: "MakeMeHire — Free Live Resume Builder & PDF Generator",
    description:
      "Create professional, ATS-compliant resumes with real-time multi-device preview, customizable sections, and instant PDF export.",
    type: "website",
    siteName: "MakeMeHire",
  },
  twitter: {
    card: "summary_large_image",
    title: "MakeMeHire — Free Live Resume Builder & PDF Generator",
    description:
      "Create professional, ATS-compliant resumes with real-time multi-device preview and instant PDF export.",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
