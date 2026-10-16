import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/rituals-data';
import { EditorialImage } from '@/components/editorial-image';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'The House Journal | Notes on Living Well | The Wellness House',
  description: 'Thoughtful long-form essays and practical botanical guides on circadian rhythms, supplement label transparency, and sustainable everyday rituals.',
};

export default function JournalPage() {
  const featured = BLOG_POSTS[0];
  const remaining = BLOG_POSTS.slice(1);

  const articleImages = [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* Editorial Header */}
      <Reveal variant="up">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
            The House Publication
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-2">
            Notes on Living Well
          </h1>
          <p className="text-sm sm:text-base text-[#71776F] mt-3 leading-relaxed">
            Explorations in botanical science, circadian biology, and the art of slowing down in an accelerated world.
          </p>
        </div>
      </Reveal>

      {/* Featured Lead Article */}
      {featured && (
        <Reveal variant="up" delay={0.1}>
          <div className="bg-[#FFFEFA] rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              
              <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#71776F]">
                  <span className="font-mono uppercase tracking-wider text-[#30473B] font-semibold">{featured.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featured.readTime}</span>
                  </span>
                  <span>·</span>
                  <span>{featured.publishedDate}</span>
                </div>

                <Link href={`/journal/${featured.slug}`} className="block group">
                  <h2 className="font-serif text-2xl sm:text-4xl text-[#252A25] group-hover:text-[#30473B] transition-colors leading-tight font-normal">
                    {featured.title}
                  </h2>
                </Link>

                <p className="text-sm sm:text-base text-[#71776F] leading-relaxed">
                  {featured.excerpt}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#71776F]">By {featured.author}</span>
                  <Link
                    href={`/journal/${featured.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30473B] uppercase tracking-wider hover:underline"
                  >
                    <span>Read Essay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 h-full min-h-[300px]">
                <EditorialImage
                  src={articleImages[0]}
                  alt={featured.title}
                  aspectClassName="w-full h-full min-h-[300px]"
                  className="w-full h-full object-cover"
                  caption="Editorial Lead · Morning Stillness"
                />
              </div>

            </div>
          </div>
        </Reveal>
      )}

      {/* Remaining Journal Articles Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.1}>
        {remaining.map((post, idx) => (
          <StaggerItem key={post.id} className="h-full">
            <article 
              className="bg-[#FFFEFA] rounded-2xl overflow-hidden border border-[#30473B]/10 shadow-xs flex flex-col justify-between group hover:border-[#30473B]/30 hover:shadow-lg transition-all duration-300 h-full"
            >
              <div>
                <div className="aspect-16/10 w-full overflow-hidden">
                  <EditorialImage
                    src={articleImages[(idx + 1) % articleImages.length]}
                    alt={post.title}
                    aspectClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#71776F] font-mono">
                    <span className="text-[#30473B] uppercase font-semibold">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/journal/${post.slug}`} className="block group-hover:text-[#30473B] transition-colors">
                    <h3 className="font-serif text-xl font-medium text-[#252A25] leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#71776F] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-[#30473B]/05 flex items-center justify-between text-xs text-[#71776F]">
                <span>{post.author}</span>
                <Link
                  href={`/journal/${post.slug}`}
                  className="text-[#30473B] font-medium hover:underline inline-flex items-center gap-1 font-mono uppercase tracking-wider"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Consultation Banner */}
      <Reveal variant="up">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#30473B]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl text-[#252A25]">Have a Question for Our Resident Botanist?</h3>
            <p className="text-xs sm:text-sm text-[#71776F]">Book a private session in our New Delhi or Mumbai atelier.</p>
          </div>
          <Link
            href="/consultation"
            className="px-6 py-3.5 bg-[#30473B] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-lg hover:bg-[#203128] transition-all whitespace-nowrap shadow-xs"
          >
            Reserve Atelier Session
          </Link>
        </div>
      </Reveal>

    </div>
  );
}
