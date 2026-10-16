'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '@/lib/types';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';

interface WellnessJournalSectionProps {
  posts: BlogPost[];
}

export const WellnessJournalSection: React.FC<WellnessJournalSectionProps> = ({ posts }) => {
  const articleImages = [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#30473B]/10 pb-6 gap-4">
        <Reveal variant="up">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#30473B]">
              The House Gazette
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#252A25] font-normal mt-1">
              Dispatches on Science & Living
            </h2>
          </div>
        </Reveal>

        <Reveal variant="up" delay={0.1}>
          <Link
            href="/journal"
            className="text-xs font-mono uppercase tracking-wider text-[#30473B] hover:underline flex items-center gap-1 group font-medium"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" stagger={0.08}>
        {posts.slice(0, 3).map((post, idx) => (
          <StaggerItem key={post.id} as="article">
            <div className="bg-[#FFFEFA] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#30473B]/10 shadow-xs flex flex-col justify-between h-full group hover:shadow-md transition-shadow">
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#203128]">
                  <img
                    src={articleImages[idx % articleImages.length]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 sm:p-8 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#71776F] font-mono">
                    <span className="uppercase tracking-wider text-[#C58B71]">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <Link href={`/journal/${post.slug}`} className="block group-hover:text-[#30473B] transition-colors">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#252A25] leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-[#71776F] leading-relaxed line-clamp-3 font-light">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-[#30473B]/5 flex items-center justify-between text-xs text-[#71776F]">
                <span>{post.author}</span>
                <Link
                  href={`/journal/${post.slug}`}
                  className="text-[#30473B] font-mono uppercase tracking-wider text-[11px] font-medium hover:underline inline-flex items-center gap-1 group"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};
