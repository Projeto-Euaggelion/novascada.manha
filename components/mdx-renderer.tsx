import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MdxRendererProps {
  content: string;
}

// Se você quiser customizar tags específicas do Markdown usando componentes do shadcn/ui futuramente,
// basta mapeá-los neste objeto components.
const components = {
  a: ({ href, ...props }: React.ComponentProps<"a">) =>
    href?.startsWith("/") ? (
      <Link href={href} className="text-primary underline" {...props} />
    ) : (
      <a href={href} className="text-primary underline" {...props} />
    ),
  h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props} />,
  h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground" {...props} />,
  h3: ({ ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />,
  h4: ({ ...props }) => <h4 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
  h5: ({ ...props }) => <h5 className="text-base text-uppercase font-bold mt-2 mb-2 text-foreground" {...props} />,
  p: ({ ...props }) => <p className="mb-4 leading-relaxed text-muted-foreground last:mb-0" {...props} />,
  ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  li: ({ ...props }) => <li className="pl-1" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote className="my-10 py-4 pl-8 pr-4 border-l-4 border-primary text-muted-foreground" {...props} />
  ),
  hr: () => (<Separator className="my-10"/>),
  table: ({ children, ...props }: any) => (
    <div className="my-6 w-full overflow-y-auto not-prose border rounded-md">
      <Table {...props}>{children}</Table>
    </div>
  ),
  thead: ({ children, ...props }: any) => <TableHeader {...props}>{children}</TableHeader>,
  tbody: ({ children, ...props }: any) => <TableBody {...props}>{children}</TableBody>,
  tr: ({ children, ...props }: any) => <TableRow {...props}>{children}</TableRow>,
  th: ({ children, ...props }: any) => (
    <TableHead className="font-semibold text-foreground bg-muted/50" {...props}>
      {children}
    </TableHead>
  ),
  td: ({ children, ...props }: any) => (
    <TableCell className="align-top leading-relaxed whitespace-pre-line" {...props}>
      {children}
    </TableCell>
  ),
  Ads: ({ title, description, thumbnail, link }: { 
    title: string; 
    description: string; 
    thumbnail?: string; 
    link: string; 
  }) => (
    <div className="not-prose my-10">
      <Link href={link} title={title}>
        <Item variant="outline">
          {thumbnail && (
            <ItemMedia>
              <Image 
                src={thumbnail} 
                alt={title} 
                width={80} 
                height={80} 
                className="object-cover rounded-md"
              />
            </ItemMedia>
          )}
          <ItemContent className="gap-1">
            <Badge variant="secondary">Anúncio</Badge>
            <ItemTitle>{title}</ItemTitle>
            <ItemDescription>{description}</ItemDescription>
          </ItemContent>
        </Item>
      </Link>
    </div>
  ),
  Alert: ({title, description}: {
    title: string;
    description: string;
  }) => (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  ),
  Button: ({ link, text }: { 
    text: string;
    link: string; 
  }) => (
    <Button className="w-full my-6 text-sm md:text-base py-4 md:py-6">
      <Link href={link} title={text}>
        {text}
      </Link>
    </Button>)
}

export function MdxRenderer({ content }: MdxRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}