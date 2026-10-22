import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Share2, ArrowRight } from "lucide-react";
import { published, posts } from "@/server/modules/content/public";
import { metadata, jsonLd } from "@/server/modules/content/seo";
export const dynamic = "force-dynamic";
import { EditorialImage } from "@/components/editorial-image";
import { ReadingProgress } from "@/components/motion";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadata(await published("journal", slug), `/journal/${slug}`);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const record = await published("journal", slug);
  const post = record?.content as import("@/lib/types").BlogPost | undefined;

  if (!post) {
    notFound();
  }

  const relatedPosts = (await posts()).filter((p) => p.id !== post.id);

  const articleImages: Record<string, string> = {
    "post-01":
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80",
    "post-02":
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1400&q=80",
    "post-03": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
    "post-04":
      "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1400&q=80",
  };

  const heroImage =
    articleImages[post.id] ||
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80";

  return (
    <div className="pb-24">
      <script
        nonce={(await headers()).get("x-nonce") || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            author: { "@type": "Person", name: post.author },
            dateModified: record!.published_at.toISOString(),
          }),
        }}
      />
      <ReadingProgress />

      {/* Header bar */}
      <div className="bg-[#FAF7F2] border-b border-[#30473B]/05 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#71776F]">
          <Link
            href="/journal"
            className="hover:text-[#30473B] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to The Journal</span>
          </Link>
          <span className="font-mono text-[#30473B]">{post.category}</span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-8">
        {/* Meta & Title */}
        <div className="space-y-4 pb-6 border-b border-[#30473B]/10">
          <div className="flex items-center gap-3 text-xs text-[#71776F]">
            <span className="font-mono text-[#30473B] font-medium uppercase tracking-wider">
              {post.category}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
            <span>·</span>
            <span>{post.publishedDate}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal leading-tight text-balance">
            {post.title}
          </h1>

          <div className="pt-2 text-xs text-[#71776F]">
            Written by <strong className="text-[#252A25]">{post.author}</strong>
          </div>
        </div>

        {/* Lead Editorial Image */}
        <div className="rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-md">
          <EditorialImage
            src={heroImage}
            alt={post.title}
            aspectClassName="aspect-16/10 w-full"
            className="w-full h-full object-cover"
            caption={`${post.category} · The House Gazette`}
          />
        </div>

        {/* Lead Excerpt */}
        <div className="py-6 font-serif italic text-lg sm:text-xl text-[#30473B] leading-relaxed border-b border-[#30473B]/10">
          &ldquo;{post.excerpt}&rdquo;
        </div>

        {/* Article Body */}
        <div className="space-y-6 text-sm sm:text-base text-[#252A25] leading-relaxed font-sans prose prose-neutral max-w-none">
          {post.content.split("\n\n").map((paragraph, idx) => {
            if (paragraph.startsWith("### ")) {
              return (
                <h3
                  key={idx}
                  className="font-serif text-2xl text-[#30473B] font-normal pt-6 pb-1"
                >
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            if (paragraph.includes("- ")) {
              return (
                <ul
                  key={idx}
                  className="space-y-2 list-disc list-inside text-[#71776F] pl-2 text-sm"
                >
                  {paragraph.split("\n").map((li, lIdx) => (
                    <li key={lIdx}>{li.replace("- ", "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-[#71776F] leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        <div className="py-6 border-t border-[#30473B]/10 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono uppercase text-[#71776F] mr-2">
            Topics:
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-[#30473B] bg-[#FAF7F2] px-3 py-1 rounded-md border border-[#30473B]/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Related articles */}
        <div className="mt-16 pt-12 border-t border-[#30473B]/10">
          <h3 className="font-serif text-2xl text-[#30473B] mb-6">
            Further Reading
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/journal/${rel.slug}`}
                className="p-6 bg-[#FFFEFA] rounded-2xl border border-[#30473B]/10 hover:border-[#30473B]/30 hover:shadow-md transition-all group"
              >
                <span className="text-[10px] font-mono uppercase text-[#C58B71]">
                  {rel.category}
                </span>
                <h4 className="font-serif text-base font-medium text-[#252A25] group-hover:text-[#30473B] transition-colors mt-1">
                  {rel.title}
                </h4>
                <p className="text-xs text-[#71776F] mt-2 line-clamp-2">
                  {rel.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
