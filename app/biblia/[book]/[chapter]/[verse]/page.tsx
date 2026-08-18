import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBookBySlug,
  getChaptersByBook,
  getVersesByBookChapter,
  getPaginatedPostsByBookChapterVerse,
  getAllBooks,
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
import { AppBreadcrumb } from "@/components/app.breadcrumb";
import { DOTS, getPaginationRange } from "@/lib/pagination";

interface VersePageProps {
  params: Promise<{ book: string; chapter: string; verse: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const books = await getAllBooks();
  const params: { book: string; chapter: string; verse: string }[] = [];

  for (const b of books) {
    const chapters = await getChaptersByBook(b.slug);
    for (const chapter of chapters) {
      const verses = await getVersesByBookChapter(b.slug, chapter);
      for (const verse of verses) {
        params.push({ book: b.slug, chapter, verse });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: VersePageProps): Promise<Metadata> {
  const { book, chapter, verse } = await params;
  const bookInfo = await getBookBySlug(book);

  if (!bookInfo) {
    return { title: "Livro não encontrado" };
  }

  const title = `Devocionais em ${bookInfo.name} ${chapter}:${verse}`;
  const description = `Todos os devocionais que meditam em ${bookInfo.name} ${chapter}:${verse}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/biblia/${bookInfo.slug}/${chapter}/${verse}`,
    },
    openGraph: {
      title,
      description,
      url: `/biblia/${bookInfo.slug}/${chapter}/${verse}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VersePage({ params, searchParams }: VersePageProps) {
  const { book, chapter, verse } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 10;

  const bookInfo = await getBookBySlug(book);
  if (!bookInfo) {
    notFound();
  }

  const { posts, totalPages, total } = await getPaginatedPostsByBookChapterVerse(
    book,
    chapter,
    verse,
    currentPage,
    postsPerPage
  );

  if (total === 0) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Devocionais em ${bookInfo.name} ${chapter}:${verse}`,
    description: `Todos os devocionais que meditam em ${bookInfo.name} ${chapter}:${verse}.`,
    url: `/biblia/${bookInfo.slug}/${chapter}/${verse}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
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
          { label: "Bíblia", href: "/biblia" },
          { label: bookInfo.name, href: `/biblia/${bookInfo.slug}` },
          { label: chapter, href: `/biblia/${bookInfo.slug}/${chapter}` },
          { label: verse },
        ]}
      />

      <header className="space-y-2">
        <Link
          href={`/biblia/${bookInfo.slug}/${chapter}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {bookInfo.name} {chapter}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {bookInfo.name} {chapter}:{verse}
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "devocional" : "devocionais"}
        </p>
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
                href={
                  currentPage > 1
                    ? `/biblia/${bookInfo.slug}/${chapter}/${verse}?page=${currentPage - 1}`
                    : "#"
                }
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
                    href={`/biblia/${bookInfo.slug}/${chapter}/${verse}?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? `/biblia/${bookInfo.slug}/${chapter}/${verse}?page=${currentPage + 1}`
                    : "#"
                }
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}