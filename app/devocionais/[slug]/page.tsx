import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAdjacentPosts } from "@/lib/content";
import { MdxRenderer } from "@/components/mdx-renderer";
import { calculateReadingTime } from "@/utils/reading-time";
import PostFooter from "@/components/post-footer";
import { Badge } from "@/components/ui/badge"
import { AppBreadcrumb } from "@/components/app.breadcrumb";
import PlayAudioButton from "@/components/play-audio-button";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const title = post.title;
  const description = post.description;
  const pageUrl = `/devocionais/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      authors: post.author ? [post.author] : undefined,
      section: post.section?.title,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const { prev, next } = await getAdjacentPosts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author,
        }
      : undefined,
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    dateModified: post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : post.date
      ? new Date(post.date).toISOString()
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/devocionais/${slug}`,
    },
    ...(post.section && {
      articleSection: post.section.title,
      about: {
        "@type": "Thing",
        name: post.section.title,
        url: `/series/${post.section.slug}`,
      },
    }),
    ...(post.image && { image: post.image }),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="relative prose max-w-none">
        {post.section && (
          <AppBreadcrumb
            items={[
              { label: "Início", href: "/" },
              { label: "Devocionais", href: "/devocionais" },
              { label: post.section.title, href: `/series/${post.section.slug}` },
              { label: post.title }
            ]}
          />
        )}
        
        <header className="mt-12 mb-20">
          <h1 className="text-3xl font-bold tracking-tight mt-2 mb-2">{post.title}</h1>
          <h2 className="text-lg text-muted-foreground mb-4">{post.description}</h2>

          <div className="text-sm text-muted-foreground border-y py-2 my-4 flex items-center justify-between gap-2">
            <p>por {post.author}</p>
            <p>leia em {readingTime} {readingTime === 1 ? "minuto" : "minutos"}</p>
          </div>

          {post.audio?.source && (
            <PlayAudioButton
              src={post.audio.source}
              cover={post.audio.cover}
              title={post.title}
              href={`/devocionais/${slug}`}
            />
          )}
        </header>

        <MdxRenderer content={post.content} />

        <PostFooter
          title={post.title}
          description={post.description}
          slug={post.slug}
          substackUrl={post.substack}
          topics={post.topics}
        />
      </article>

      <aside className="border-t pt-10 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Leia também
        </h3>

        <ul className="flex flex-col gap-4">
          {prev ? (
            <li key={prev.slug}>
              <Link 
                href={`/devocionais/${prev.slug}`} 
                className="flex flex-col gap-2 py-4 group"
              >
                <h4 className="font-medium group-hover:underline">{prev.title}</h4>
                <p className="text-muted-foreground">{prev.description}</p>
              </Link>
            </li>
          ) : (
            <span className="opacity-40">← Fim do feed</span>
          )}
          {next && (
            <li key={next.slug}>
              <Link 
                href={`/devocionais/${next.slug}`} 
                className="flex flex-col gap-2 py-4 group"
              >
                <h4 className="font-medium group-hover:underline">{next.title}</h4>
                <p className="text-muted-foreground">{next.description}</p>
              </Link>
            </li>
          )}
        </ul>

        <div className="mt-4">
          <Link href="/devocionais" className="text-sm font-medium hover:underline text-muted-foreground hover:text-foreground">
            Todos os devocionais →
          </Link>
        </div>
      </aside>
    </div>
  );
}