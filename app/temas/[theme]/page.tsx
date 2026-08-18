import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicBySlug, getPaginatedPostsByTopic, getAllTopics } from "@/lib/content";
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

interface ThemePageProps {
  params: Promise<{ theme: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const allTopics = await getAllTopics();
  return allTopics.map((topic) => ({ theme: topic.slug }));
}

export async function generateMetadata({ params }: ThemePageProps): Promise<Metadata> {
  const { theme } = await params;
  const topic = await getTopicBySlug(theme);

  if (!topic) {
    return { title: "Tema não encontrado" };
  }

  const title = `Tema: ${topic.name}`;
  const description = `Devocionais sobre ${topic.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/temas/${topic.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/temas/${topic.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ThemePage({ params, searchParams }: ThemePageProps) {
  const { theme } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 10;

  const topic = await getTopicBySlug(theme);
  if (!topic) {
    notFound();
  }

  const { posts, totalPages } = await getPaginatedPostsByTopic(theme, currentPage, postsPerPage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Tema: ${topic.name}`,
    description: `Devocionais sobre ${topic.name}.`,
    url: `/temas/${topic.slug}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
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
          { label: "Temas", href: "/temas" },
          { label: topic.name },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
        <p className="text-sm text-muted-foreground">
          {topic.postCount} {topic.postCount === 1 ? "devocional publicado" : "devocionais publicados"} neste tema
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
                href={currentPage > 1 ? `/temas/${topic.slug}?page=${currentPage - 1}` : "#"}
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
                    href={`/temas/${topic.slug}?page=${pageNumber}`}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `/temas/${topic.slug}?page=${currentPage + 1}` : "#"}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}