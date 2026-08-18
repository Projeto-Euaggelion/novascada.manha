import { Metadata } from "next";
import Link from "next/link";
import { getPaginatedBooks } from "@/lib/content";
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
  title: "Devocionais Bíblicos",
  description: "Explore devocionais organizados por livro da Bíblia e medite na Palavra de Deus.",
  alternates: {
    canonical: "/biblia",
  },
  openGraph: {
    title: "Devocionais Bíblicos",
    description: "Explore devocionais organizados por livro da Bíblia e medite na Palavra de Deus.",
    url: "/biblia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devocionais Bíblicos",
    description: "Explore devocionais organizados por livro da Bíblia e medite na Palavra de Deus.",
  },
};

interface BibliaPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BibliaPage({ searchParams }: BibliaPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const booksPerPage = 10;

  const { books, totalPages } = await getPaginatedBooks(currentPage, booksPerPage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Devocionais Bíblicos",
    description: "Explore devocionais organizados por livro da Bíblia e medite na Palavra de Deus.",
    url: `/biblia${currentPage > 1 ? `?page=${currentPage}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: books.map((book, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `/biblia/${book.slug}`,
        name: book.name,
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
          { label: "Bíblia" },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Devocionais Bíblicos</h1>
        <p className="text-sm text-muted-foreground">Medite em nossos devocionais bíblicos navegando pelos livros da Bíblia Sagrada.</p>
      </header>

      <div className="divide-y border-t border-b">
        {books.map((book) => (
          <article key={book.slug} className="py-6 flex flex-col gap-2">
            <Link href={`/biblia/${book.slug}`}>
              <h3 className="font-bold hover:underline text-lg">{book.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {book.postCount} {book.postCount === 1 ? "devocional" : "devocionais"}
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
                href={currentPage > 1 ? `/biblia?page=${currentPage - 1}` : "#"}
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
                    href={`/biblia?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/biblia?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}