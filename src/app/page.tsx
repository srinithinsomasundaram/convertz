import ConvertApp from "@/components/ConvertApp";
import { auth } from "@/auth";
import { getCanonicalUserId, getConversionsForOwner } from "@/lib/conversionsServer";
import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Online File Converter",
  description:
    "Convert PDF, Word, Excel, images, and media online with Convertz. Fast local-first tools for merge PDF, compress PDF, PDF to Word, and more.",
  keywords: [
    "free online file converter",
    "pdf to word",
    "merge pdf",
    "compress pdf",
    "word to pdf",
    "heic to jpg",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Convertz | Free Online File Converter",
    description:
      "Convert documents, images, spreadsheets, and media with secure local-first tools on Convertz.",
    type: "website",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
  },
};

export default async function Home() {
  const session = await auth();
  const canonicalUserId = await getCanonicalUserId({
    id: session?.user?.id,
    email: session?.user?.email ?? null,
  });
  const initialHistory = await getConversionsForOwner({
    userId: canonicalUserId,
  });

  return <ConvertApp initialHistory={initialHistory} />;
}
