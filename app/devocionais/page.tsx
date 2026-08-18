import { Metadata } from "next";
import Link from "next/link";
import { getPaginatedPosts } from "@/lib/content";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AppBreadcrumb } from "@/components/app.breadcrumb";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Todos os Devocionais",
  description: "Edifique sua fé com nossos devocionais diários. Leia edições anteriores e medite na Palavra de Deus.",
  alternates: {
    canonical: "/devocionais",
  },
  openGraph: {
    title: "Todos os Devocionais",
    description: "Edifique sua fé com nossos devocionais diários. Leia edições anteriores e medite na Palavra de Deus.",
    url: "/devocionais",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todos os Devocionais",
    description: "Edifique sua fé com nossos devocionais diários. Leia edições anteriores e medite na Palavra de Deus.",
  },
};

interface EdicoesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function EdicoesPage({ searchParams }: EdicoesPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 10;
  
  const { posts, totalPages } = await getPaginatedPosts(currentPage, postsPerPage);

  // Construção do objeto JSON-LD para página de listagem
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Todos os Devocionais",
    description: "Edifique sua fé com nossos devocionais diários. Leia edições anteriores e medite na Palavra de Deus.",
    url: `/devocionais${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/devocionais/${post.slug}`,
        name: post.title,
        description: post.description,
      })),
    },
  };

  return (
    <>
    <section className="space-y-12">
      {/* Injeção de dados estruturados para listagem */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AppBreadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Devocionais", href: "/devocionais" }
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Todos os devocionais</h1>
        <p className="text-sm text-muted-foreground">Edifique sua fé com nossos devocionais diários</p>
      </header>

      <div className="divide-y border-t border-b">
        {posts.map((post) => (
          <article key={post.slug} className="py-6 flex flex-col gap-2">
            <time className="text-sm text-muted-foreground">
              {new Date(`${post.date.split("T")[0]}T12:00:00`).toLocaleDateString("pt-BR", { 
                dateStyle: "long" 
              })}
            </time>
            <Link href={`/devocionais/${post.slug}`}>
              <h3 className="font-bold hover:underline text-lg">{post.title}</h3>
              <p className="text-muted-foreground">{post.description}</p>
            </Link>
          </article>
        ))}
      </div>

      <ins className="adsbygoogle"
        style={{display: 'block'}}
        data-ad-format="fluid"
        data-ad-layout-key="-fs+3n+7a-ag-4h"
        data-ad-client="ca-pub-8744567957048944"
        data-ad-slot="4222239009"
      ></ins>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={currentPage > 1 ? `/devocionais?page=${currentPage - 1}` : "#"}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href={`/devocionais?page=${i + 1}`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href={currentPage < totalPages ? `/devocionais?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
    <Script 
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8744567957048944" 
      strategy="lazyOnload"
      crossOrigin="anonymous"
    ></Script>
    <Script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </Script>
    </>
  );
}