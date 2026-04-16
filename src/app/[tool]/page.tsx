import ConvertApp from "@/components/ConvertApp";
import { toolIdBySlug } from "@/lib/toolSlugs";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { toolSeoData } from "@/lib/toolSeo";
import { auth } from "@/auth";
import { getCanonicalUserId, getConversionsForOwner } from "@/lib/conversionsServer";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata(
  props: { params: Promise<{ tool: string }> }
): Promise<Metadata> {
  const { tool: toolSlug } = await props.params;
  const toolName = toolSlug.replace(/-/g, " ");
  const seo = toolSeoData[toolSlug];

  return {
    title: seo?.metaTitle?.replace(/ \| Convertz$/, "") ?? `${toolName} Converter`,
    description:
      seo?.metaDescription ?? `Use ${toolName} online with Convertz for fast file conversion.`,
    keywords: seo?.keywords ?? [toolName, "file conversion", "online converter"],
    alternates: {
      canonical: absoluteUrl(`/${toolSlug}`),
    },
    openGraph: {
      title: seo?.metaTitle ?? `${toolName} Converter | ${siteConfig.name}`,
      description:
        seo?.metaDescription ?? `Use ${toolName} online with ${siteConfig.name}.`,
      type: "website",
      url: absoluteUrl(`/${toolSlug}`),
      siteName: siteConfig.name,
      images: [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.metaTitle ?? `${toolName} Converter | ${siteConfig.name}`,
      description:
        seo?.metaDescription ?? `Use ${toolName} online with ${siteConfig.name}.`,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: toolSlug } = await params;

  if (!toolIdBySlug[toolSlug]) {
    notFound();
  }

  const seo = toolSeoData[toolSlug];
  const toolName = activeTitle(toolSlug);
  
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seo?.heroTitle ?? `${toolName} Online`,
      description: seo?.metaDescription ?? `Fast online ${toolName} conversion tool.`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      url: absoluteUrl(`/${toolSlug}`),
      publisher: {
        "@type": "Organization",
        name: siteConfig.creator,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: seo?.heroTitle ?? `${toolName} Online`,
      description: seo?.intro ?? seo?.metaDescription,
      step:
        seo?.howTo.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step,
          text: step,
        })) ?? [],
      totalTime: "PT1M",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity:
        seo?.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })) ?? [],
    },
  ];

  const session = await auth();
  const canonicalUserId = await getCanonicalUserId({
    id: session?.user?.id,
    email: session?.user?.email ?? null,
  });
  const initialHistory = session?.user?.id 
    ? await getConversionsForOwner({ userId: canonicalUserId })
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ConvertApp initialToolSlug={toolSlug} initialHistory={initialHistory} />
    </>
  );
}

function activeTitle(toolSlug: string) {
  return toolSlug.replace(/-/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}
