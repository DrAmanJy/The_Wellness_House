"use client";
import React from "react";
import { useStore } from "@/context/store-context";
import Link from "next/link";

export const AnnouncementBar: React.FC = () => {
  const { siteConfig } = useStore();
  return (
    <div
      data-announcement-bar
      className="bg-[#203128] text-[#FAF7F2] text-xs py-2 px-4 text-center tracking-wider font-medium border-b border-[#30473B]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4">
        <span className="hidden sm:inline text-[#CAD6BC]/80">
          The Wellness House Sanctuary & Compounding Atelier
        </span>
        <span className="hidden sm:inline text-[#CAD6BC]/40">·</span>
        <span>
          {siteConfig?.announcement || "Private consultations by appointment"}
        </span>
        <span className="hidden md:inline text-[#CAD6BC]/40">·</span>
        <Link
          href="/consultation"
          className="hidden md:inline font-mono text-[#CAD6BC] hover:underline"
        >
          Reserve Atelier Session
        </Link>
      </div>
    </div>
  );
};
