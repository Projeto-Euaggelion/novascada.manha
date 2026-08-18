import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next"
import { Geist_Mono, Roboto, Merriweather } from "next/font/google";
import "./globals.css"
import { cn } from "@/lib/utils";
import SiteNav from "@/components/site-nav";
import { getAllTopics } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import CTALinks from "@/components/cta-links";
import Script from "next/script";

const merriweatherHeading = Merriweather({subsets:['latin'],variable:'--font-heading'});
const roboto = Roboto({subsets:['latin'],variable:'--font-sans'})
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const baseUrl = "https://novasdecadamanha.com.br";
const defaultTitle = "Novas de Cada Manhã";
const defaultDescription = "Devocionais diários para edificar sua fé. Medite, todas as manhãs, na palavra de Deus e edifique a sua fé.";

export const metadata: Metadata = {
  title: {
    default: `${defaultTitle} | Devocionais diários para edificar sua fé`,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "./",
    types: {
      "application/rss+xml": `${baseUrl}/feed.rss`,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: baseUrl,
    siteName: defaultTitle,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const topics = await getAllTopics();
  const visibleTopics = topics.slice(0, 40);

  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable, merriweatherHeading.variable)}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8744567957048944"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <SiteNav />

        <main className="flex-1 max-w-2xl mx-auto px-8 md:px-0 pt-32 pb-20 w-full">
          {children}
        </main>

        <footer>
          <ins
            className="adsbygoogle"
            style={{
              width: "100%",
              display: "block"
            }}
            data-ad-client="ca-pub-8744567957048944"
            data-ad-slot="1647564056"
            data-ad-format="auto"
            data-full-width-responsive="true"
          >  
          </ins>

          <ul className="border-t border-ring/20 max-w-8xl mx-auto p-6 flex flex-col md:flex-row flex-wrap justify-start items-center gap-4 md:gap-6 border-b bg-secondary/30">
            <li>
              Receba nossos devocionais no:
            </li>
            
            <CTALinks />
          </ul>
          {visibleTopics.length > 0 && (
            <div className="max-w-8xl mx-auto p-6 border-b">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Temas
              </h2>
              <ul className="flex flex-row flex-wrap gap-2 mt-6">
                {visibleTopics.map((topic) => (
                  <li key={topic.slug}>
                    <Link
                      className="text-sm text-muted-foreground hover:text-foreground"
                      href={`/temas/${topic.slug}`}
                      title={topic.name}
                    >
                      <Badge variant="secondary">
                        {topic.name}
                      </Badge>
                    </Link>
                  </li>
                ))}
                <li className="w-full mt-6 text-right">
                  <Link href="/temas" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Todos os temas →
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <iframe 
            src="https://cadamanha.substack.com/embed"
            style={{
              border: "0",
              width: "100%",
              height: "320px"
            }}
          />
          <ul className="max-w-8xl mx-auto p-6 flex flex-row flex-wrap justify-start items-center gap-4 border-b">
            <li>
              <Link className="text-sm text-muted-foreground" href="/apoie" title="Apoie">Apoie</Link>
            </li>
            <li>
              <Link className="text-sm text-muted-foreground" href="/blog" title="Blog">Blog</Link>
            </li>
            <li>
              <Link className="text-sm text-muted-foreground" href="/sobre" title="Sobre">Sobre</Link>
            </li>
            <li>
              <Link className="text-sm text-muted-foreground" href="/termos-uso" title="Termos de Uso">Termos de Uso</Link>
            </li>
            <li>
              <Link className="text-sm text-muted-foreground" href="/politica-de-privacidade" title="Política de Privacidade">Política de Privacidade</Link>
            </li>

            <li className="md:ml-auto">
              <Link className="text-sm text-muted-foreground" href="/feed.rss" title="Feed">feed.rss</Link>
            </li>
          </ul>
          <div className="max-w-8xl mx-auto p-6 flex flex-col md:flex-row md:justify-between items-start gap-2">
            <p className="text-sm text-muted-foreground">
              <span>{new Date().getFullYear()}</span> <span>&copy; Novas de Cada Manhã</span>
            </p>
            <p className="text-sm text-muted-foreground">Um site do <a href="https://euaggelion.com.br" target="_blanck" title="Projeto Euaggelion" className="text-primary">Projeto Euaggelion</a></p>
          </div>
        </footer>
        <Analytics/>
        <Script
          id="adsbygoogle-push-footer"
          strategy="afterInteractive"
        >
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </body>
    </html>
  )
}
