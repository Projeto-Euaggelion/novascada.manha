import { Metadata } from "next";
import Link from "next/link";
import { getPaginatedSeries } from "@/lib/content";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AppBreadcrumb } from "@/components/app.breadcrumb";
import { DOTS, getPaginationRange } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Todas as Séries Temáticas",
  description: "Explore nossas séries temáticas de devocionais e medite na Palavra de Deus por temas.",
  alternates: {
    canonical: "/series",
  },
  openGraph: {
    title: "Todas as Séries Temáticas",
    description: "Explore nossas séries temáticas de devocionais e medite na Palavra de Deus por temas.",
    url: "/series",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Todas as Séries Temáticas",
    description: "Explore nossas séries temáticas de devocionais e medite na Palavra de Deus por temas.",
  },
};

interface SeriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const seriesPerPage = 10;

  const { series, totalPages } = await getPaginatedSeries(currentPage, seriesPerPage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Todas as Séries Temáticas",
    description: "Explore nossas séries temáticas de devocionais e medite na Palavra de Deus por temas.",
    url: `/series${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: series.map((s, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/series/${s.slug}`,
        name: s.title,
        description: s.description,
      })),
    },
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AppBreadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Séries"}
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Todas as séries Temáticas</h1>
        <p className="text-sm text-muted-foreground">Explore nossas séries temáticas de devocionais</p>
      </header>

      <div className="divide-y border-t border-b">
        {series.map((s) => (
          <article key={s.slug} className="py-6 flex flex-col gap-2">
            <Link href={`/series/${s.slug}`}>
              <h3 className="font-bold hover:underline text-lg">{s.title}</h3>
              {s.description && (
                <p className="text-muted-foreground">{s.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {s.postCount} {s.postCount === 1 ? "edição" : "edições"}
              </p>
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `/series?page=${currentPage - 1}` : "#"}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {getPaginationRange(currentPage, totalPages).map((pageNumber, i) =>
              pageNumber === DOTS ? (
                <PaginationItem key={`dots-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`/series?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/series?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}