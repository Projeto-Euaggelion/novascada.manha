import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeriesBySlug, getPaginatedPostsBySeries, getAllSeries } from "@/lib/content";
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

interface SeriePageProps {
  params: Promise<{ serie: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const allSeries = await getAllSeries();
  return allSeries.map((series) => ({ serie: series.slug }));
}

export async function generateMetadata({ params }: SeriePageProps): Promise<Metadata> {
  const { serie } = await params;
  const series = await getSeriesBySlug(serie);

  if (!series) {
    return { title: "Série não encontrada" };
  }

  const title = series.title;
  const description = series.description || `Devocionais da série ${series.title}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/series/${series.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/series/${series.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SeriePage({ params, searchParams }: SeriePageProps) {
  const { serie } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 10;

  const series = await getSeriesBySlug(serie);
  if (!series) {
    notFound();
  }

  const { posts, totalPages } = await getPaginatedPostsBySeries(serie, currentPage, postsPerPage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: series.title,
    description: series.description,
    url: `/series/${series.slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
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
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AppBreadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Séries", href: "/series" },
          { label: series.title },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">[Série] {series.title}</h1>
        {series.description && (
          <p className="text-sm text-muted-foreground">{series.description}</p>
        )}
      </header>

      <div className="divide-y border-t border-b">
        {posts.map((post) => (
          <article key={post.slug} className="py-6 flex flex-col gap-2">
            <time className="text-sm text-muted-foreground">
              {new Date(`${post.date.split("T")[0]}T12:00:00`).toLocaleDateString("pt-BR", {
                dateStyle: "long",
              })}
            </time>
            <Link href={`/devocionais/${post.slug}`}>
              <h3 className="font-bold hover:underline text-lg">{post.title}</h3>
              <p className="text-muted-foreground">{post.description}</p>
            </Link>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `/series/${series.slug}?page=${currentPage - 1}` : "#"}
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
                    href={`/series/${series.slug}?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/series/${series.slug}?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}