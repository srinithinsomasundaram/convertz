import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { absoluteUrl, siteConfig } from "@/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "Convertz | Online File Converter By YESP Studio",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "file converter",
    "pdf converter",
    "pdf to word",
    "merge pdf",
    "compress pdf",
    "word to pdf",
    "excel to pdf",
    "convert files online",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Convertz | Online File Converter By YESP Studio",
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} file conversion tools`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convertz | Online File Converter By YESP Studio",
    description: siteConfig.description,
    creator: siteConfig.xHandle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

import { Providers } from "@/components/Providers";
import { auth } from "@/auth";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Providers session={session}>
          <div className="flex-1">{children}</div>
          <footer className="border-t border-slate-200 bg-white py-12 text-sm text-slate-500">
            <div className="mx-auto max-w-5xl px-6">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <Logo />
                </Link>
                <div className="flex gap-6 font-semibold">
                  <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
                  <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
                  <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
                  <Link href={siteConfig.githubRepo} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">GitHub</Link>
                  <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} Convertz. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": siteConfig.name,
              "description": siteConfig.description,
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Any",
              "url": siteConfig.url,
              "author": {
                "@type": "Organization",
                "name": siteConfig.creator,
                "url": "https://yespstudio.com"
              },
              "sameAs": [
                siteConfig.githubRepo,
                "https://x.com/yespstudio"
              ]
            }),
          }}
        />
      </body>
    </html>
  );
}
