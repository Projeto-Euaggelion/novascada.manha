import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { slugify } from "@/lib/slugify";

// Caminhos base para as pastas de conteúdo
const DEVOTIONAL_PATH = path.join(process.cwd(), "content/devocionais");
const BLOG_PATH = path.join(process.cwd(), "content/blog");
const PAGES_PATH = path.join(process.cwd(), "content/pages");

export interface PostReference {
  book: string;
  chapter: string;
  verse: string;
}

export interface PostSection {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface PostAudio {
  source: string;
  cover?: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  substack: string;
  content: string;
  section?: PostSection;
  reference?: PostReference;
  audio?: PostAudio;
  [key: string]: any;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  substack: string;
  content: string;
  [key: string]: any;
}

export interface PageContent {
  slug: string;
  title: string;
  substack: string;
  content: string;
  [key: string]: any;
}

// ----------------------------------------------------------------
// Funções Auxiliares para Edições (Devocionais)
// ----------------------------------------------------------------

// Retorna todas as edições ordenadas por data (mais recente primeiro)
export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(DEVOTIONAL_PATH)) {
    return [];
  }

  const files = fs.readdirSync(DEVOTIONAL_PATH);

  const posts = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(DEVOTIONAL_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace(/\.mdx?$/, ""),
        title: data.title || "Edição sem título",
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        substack: data.substack || "",
        content,
        ...data,
      };
    });

  // Ordena por data decrescente
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Retorna as X edições mais recentes (usado na Home)
export async function getLatestPosts(count: number): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, count);
}

// Busca uma edição específica pelo slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(DEVOTIONAL_PATH, `${slug}.mdx`);
    
    // Suporte caso salve apenas como .md
    const finalPath = fs.existsSync(filePath) 
      ? filePath 
      : path.join(DEVOTIONAL_PATH, `${slug}.md`);

    if (!fs.existsSync(finalPath)) return null;

    const fileContent = fs.readFileSync(finalPath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || "Edição sem título",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      substack: data.substack || "",
      section: data.section as PostSection | undefined,
      reference: data.reference as PostReference | undefined,
      content,
      ...data,
    };
  } catch {
    return null;
  }
}

// Paginação do feed completo (/edicoes)
export async function getPaginatedPosts(page: number, limit: number) {
  const allPosts = await getAllPosts();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: allPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(allPosts.length / limit),
  };
}

// Busca posts adjacentes para navegação (Próximo e Anterior)
export async function getAdjacentPosts(currentSlug: string) {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    prev: prevPost ? { slug: prevPost.slug, title: prevPost.title, description: prevPost.description } : null,
    next: nextPost ? { slug: nextPost.slug, title: nextPost.title, description: nextPost.description } : null,
  };
}

// ----------------------------------------------------------------
// Funções Auxiliares para o Blog (/content/blog)
// ----------------------------------------------------------------

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(BLOG_PATH)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_PATH);

  const posts = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(BLOG_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace(/\.mdx?$/, ""),
        title: data.title || "Artigo sem título",
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        substack: data.substack || "",
        content,
        ...data,
      };
    });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getLatestBlogPosts(count: number): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.slice(0, count);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_PATH, `${slug}.mdx`);
    
    const finalPath = fs.existsSync(filePath) 
      ? filePath 
      : path.join(BLOG_PATH, `${slug}.md`);

    if (!fs.existsSync(finalPath)) return null;

    const fileContent = fs.readFileSync(finalPath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || "Artigo sem título",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      substack: data.substack || "",
      topics: data.topics,
      content,
      ...data,
    };
  } catch {
    return null;
  }
}

export async function getPaginatedBlogPosts(page: number, limit: number) {
  const allPosts = await getAllBlogPosts();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: allPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(allPosts.length / limit),
  };
}

export async function getAdjacentBlogPosts(currentSlug: string) {
  const allPosts = await getAllBlogPosts();
  const currentIndex = allPosts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    prev: prevPost ? { slug: prevPost.slug, title: prevPost.title, description: prevPost.description } : null,
    next: nextPost ? { slug: nextPost.slug, title: nextPost.title, description: nextPost.description } : null,
  };
}

// ----------------------------------------------------------------
// Funções Auxiliares para Páginas Internas (/sobre, etc)
// ----------------------------------------------------------------

export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  try {
    const filePath = path.join(PAGES_PATH, `${slug}.mdx`);
    const finalPath = fs.existsSync(filePath) 
      ? filePath 
      : path.join(PAGES_PATH, `${slug}.md`);

    if (!fs.existsSync(finalPath)) return null;

    const fileContent = fs.readFileSync(finalPath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || "",
      substack: data.substack || "",
      content,
      ...data,
    };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
// Funções Auxiliares para Séries (agrupadas pelo frontmatter "section")
// ----------------------------------------------------------------

export interface SeriesInfo {
  id: string;
  title: string;
  slug: string;
  description?: string;
  postCount: number;
}

// Retorna metadados de todas as séries encontradas nos devocionais
export async function getAllSeries(): Promise<SeriesInfo[]> {
  const allPosts = await getAllPosts();
  const seriesMap = new Map<string, SeriesInfo>();

  for (const post of allPosts) {
    const section = post.section;
    if (!section?.slug) continue;

    const existing = seriesMap.get(section.slug);
    if (existing) {
      existing.postCount += 1;
    } else {
      seriesMap.set(section.slug, {
        id: section.id,
        title: section.title,
        slug: section.slug,
        description: section.description,
        postCount: 1,
      });
    }
  }

  return Array.from(seriesMap.values());
}

// Busca os metadados de uma série específica pelo slug
export async function getSeriesBySlug(seriesSlug: string): Promise<SeriesInfo | null> {
  const allSeries = await getAllSeries();
  return allSeries.find((s) => s.slug === seriesSlug) || null;
}

// Retorna todos os devocionais de uma série, ordenados por data (mais recente primeiro)
export async function getPostsBySeries(seriesSlug: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.section?.slug === seriesSlug);
}

// Paginação dos devocionais de uma série (/series/[serie])
export async function getPaginatedPostsBySeries(seriesSlug: string, page: number, limit: number) {
  const seriesPosts = await getPostsBySeries(seriesSlug);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: seriesPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(seriesPosts.length / limit),
    total: seriesPosts.length,
  };
}

// Paginação do índice de séries (/series)
export async function getPaginatedSeries(page: number, limit: number) {
  const allSeries = await getAllSeries();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    series: allSeries.slice(startIndex, endIndex),
    totalPages: Math.ceil(allSeries.length / limit),
    total: allSeries.length,
  };
}

// ----------------------------------------------------------------
// Funções Auxiliares para a Bíblia (agrupadas pelo frontmatter "reference")
// ----------------------------------------------------------------

// Gera um slug de URL a partir de um nome de livro (remove acentos, espaços -> hífen)
export function slugifyBookName(book: string): string {
  return slugify(book);
}

export interface BookInfo {
  slug: string;
  name: string;
  postCount: number;
}

// Retorna todos os livros encontrados nos devocionais, com contagem
export async function getAllBooks(): Promise<BookInfo[]> {
  const allPosts = await getAllPosts();
  const booksMap = new Map<string, BookInfo>();

  for (const post of allPosts) {
    const book = post.reference?.book;
    if (!book) continue;

    const slug = slugify(book);
    const existing = booksMap.get(slug);
    if (existing) {
      existing.postCount += 1;
    } else {
      booksMap.set(slug, { slug, name: book, postCount: 1 });
    }
  }

  return Array.from(booksMap.values());
}

// Busca o nome original do livro a partir do slug
export async function getBookBySlug(bookSlug: string): Promise<BookInfo | null> {
  const allBooks = await getAllBooks();
  return allBooks.find((b) => b.slug === bookSlug) || null;
}

// Retorna todos os posts de um livro
export async function getPostsByBook(bookSlug: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(
    (post) => post.reference?.book && slugify(post.reference.book) === bookSlug
  );
}

export async function getPaginatedPostsByBook(bookSlug: string, page: number, limit: number) {
  const posts = await getPostsByBook(bookSlug);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages: Math.ceil(posts.length / limit),
    total: posts.length,
  };
}

// Retorna todos os posts de um livro + capítulo
export async function getPostsByBookChapter(bookSlug: string, chapter: string): Promise<Post[]> {
  const bookPosts = await getPostsByBook(bookSlug);
  return bookPosts.filter((post) => post.reference?.chapter === chapter);
}

export async function getPaginatedPostsByBookChapter(
  bookSlug: string,
  chapter: string,
  page: number,
  limit: number
) {
  const posts = await getPostsByBookChapter(bookSlug, chapter);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages: Math.ceil(posts.length / limit),
    total: posts.length,
  };
}

// Retorna todos os posts de um livro + capítulo + versículo
export async function getPostsByBookChapterVerse(
  bookSlug: string,
  chapter: string,
  verse: string
): Promise<Post[]> {
  const chapterPosts = await getPostsByBookChapter(bookSlug, chapter);
  return chapterPosts.filter((post) => post.reference?.verse === verse);
}

export async function getPaginatedPostsByBookChapterVerse(
  bookSlug: string,
  chapter: string,
  verse: string,
  page: number,
  limit: number
) {
  const posts = await getPostsByBookChapterVerse(bookSlug, chapter, verse);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPages: Math.ceil(posts.length / limit),
    total: posts.length,
  };
}

// Retorna todos os capítulos únicos de um livro (para generateStaticParams)
export async function getChaptersByBook(bookSlug: string): Promise<string[]> {
  const posts = await getPostsByBook(bookSlug);
  const chapters = new Set(posts.map((p) => p.reference?.chapter).filter(Boolean) as string[]);
  return Array.from(chapters).sort((a, b) => Number(a) - Number(b));
}

// Retorna todos os versículos únicos de um livro + capítulo (para generateStaticParams)
export async function getVersesByBookChapter(bookSlug: string, chapter: string): Promise<string[]> {
  const posts = await getPostsByBookChapter(bookSlug, chapter);
  const verses = new Set(posts.map((p) => p.reference?.verse).filter(Boolean) as string[]);
  return Array.from(verses).sort((a, b) => Number(a) - Number(b));
}

// Paginação do índice de livros (/biblia)
export async function getPaginatedBooks(page: number, limit: number) {
  const allBooks = await getAllBooks();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    books: allBooks.slice(startIndex, endIndex),
    totalPages: Math.ceil(allBooks.length / limit),
    total: allBooks.length,
  };
}

export interface TopicInfo {
  slug: string;
  name: string;
  postCount: number;
}

// Retorna todos os temas encontrados nos devocionais, com contagem
export async function getAllTopics(): Promise<TopicInfo[]> {
  const allPosts = await getAllPosts();
  const topicsMap = new Map<string, TopicInfo>();

  for (const post of allPosts) {
    const topics = post.topics as string[] | undefined;
    if (!topics) continue;

    for (const topic of topics) {
      const slug = slugify(topic);
      const existing = topicsMap.get(slug);
      if (existing) {
        existing.postCount += 1;
      } else {
        topicsMap.set(slug, { slug, name: topic, postCount: 1 });
      }
    }
  }

  return Array.from(topicsMap.values()).sort((a, b) => b.postCount - a.postCount);
}

// Busca o nome original do tema a partir do slug
export async function getTopicBySlug(topicSlug: string): Promise<TopicInfo | null> {
  const allTopics = await getAllTopics();
  return allTopics.find((t) => t.slug === topicSlug) || null;
}

// Retorna todos os posts de um tema
export async function getPostsByTopic(topicSlug: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => {
    const topics = post.topics as string[] | undefined;
    return topics?.some((topic) => slugify(topic) === topicSlug);
  });
}

// Paginação dos devocionais de um tema (/temas/[theme])
export async function getPaginatedPostsByTopic(topicSlug: string, page: number, limit: number) {
  const topicPosts = await getPostsByTopic(topicSlug);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    posts: topicPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(topicPosts.length / limit),
    total: topicPosts.length,
  };
}

// Paginação do índice de temas (/temas)
export async function getPaginatedTopics(page: number, limit: number) {
  const allTopics = await getAllTopics();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    topics: allTopics.slice(startIndex, endIndex),
    totalPages: Math.ceil(allTopics.length / limit),
    total: allTopics.length,
  };
}