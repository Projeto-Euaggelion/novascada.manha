import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBookBySlug,
  getPaginatedPostsByBook,
  getChaptersByBook,
  getAllBooks
} from "@/lib/content";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { AppBreadcrumb } from "@/components/app.breadcrumb";
import { DOTS, getPaginationRange } from "@/lib/pagination";

interface BookPageProps {
  params: Promise<{ book: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const books = await getAllBooks();
  return books.map((b) => ({ book: b.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { book } = await params;
  const bookInfo = await getBookBySlug(book);

  if (!bookInfo) {
    return { title: "Livro não encontrado" };
  }

  const title = `Devocionais em ${bookInfo.name}`;
  const description = `Todos os devocionais que meditam em ${bookInfo.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/biblia/${bookInfo.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/biblia/${bookInfo.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { book } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 10;

  const bookInfo = await getBookBySlug(book);
  if (!bookInfo) {
    notFound();
  }

  const [{ posts, totalPages }, chapters] = await Promise.all([
    getPaginatedPostsByBook(book, currentPage, postsPerPage),
    getChaptersByBook(book),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Devocionais em ${bookInfo.name}`,
    description: `Todos os devocionais que meditam em ${bookInfo.name}.`,
    url: `/biblia/${bookInfo.slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
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
    <section className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AppBreadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Bíblia", href: "/biblia" },
          { label: bookInfo.name }
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Devocionais em {bookInfo.name}</h1>
        <p className="text-sm text-muted-foreground">
          {bookInfo.postCount} {bookInfo.postCount === 1 ? "devocional" : "devocionais"} publicados
        </p>
      </header>

      {chapters.length > 0 && (
        <nav aria-label="Capítulos disponíveis" className="border-t pt-12 flex flex-wrap gap-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter}
              href={`/biblia/${bookInfo.slug}/${chapter}`}
            >
              <Badge variant="outline" className="text-sm px-2 py-4">
                {chapter}
              </Badge>
            </Link>
          ))}
        </nav>
      )}

      <div className="divide-y border-t border-b">
        {posts.map((post) => (
          <article key={post.slug} className="py-6 flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              {post.reference && (
                <Link
                  href={`/biblia/${bookInfo.slug}/${post.reference.chapter}/`}
                >
                  <Badge>
                    {bookInfo.name} {post.reference.chapter}
                  </Badge>
                </Link>
              )}
              <time className="text-sm text-muted-foreground">
                {new Date(`${post.date.split("T")[0]}T12:00:00`).toLocaleDateString("pt-BR", {
                  dateStyle: "long",
                })}
              </time>
            </div>
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
                href={currentPage > 1 ? `/biblia/${bookInfo.slug}?page=${currentPage - 1}` : "#"}
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
                    href={`/biblia/${bookInfo.slug}?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/biblia/${bookInfo.slug}?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}