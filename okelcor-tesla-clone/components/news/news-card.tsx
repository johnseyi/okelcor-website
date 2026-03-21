"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Article } from "./data";

type Props = {
  article: Article;
  featured?: boolean;
};

export default function NewsCard({ article, featured = false }: Props) {
  if (featured) {
    return (
      <motion.div
        whileHover={{ scale: 1.012, boxShadow: "0 12px 36px rgba(0,0,0,0.09)" }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="rounded-[22px]"
      >
      <Link
        href={`/news/${article.slug}`}
        className="group grid overflow-hidden rounded-[22px] bg-[#efefef] md:grid-cols-[1.4fr_1fr]"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[380px]">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] backdrop-blur-sm">
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-8 md:p-10">
          <div>
            <p className="text-[0.8rem] text-[var(--muted)]">
              {article.date} · {article.readTime}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-[var(--foreground)] md:text-3xl">
              {article.title}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-[var(--muted)]">
              {article.summary}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[0.88rem] font-semibold text-[var(--primary)] transition group-hover:gap-3">
            Read Article
            <ArrowRight size={15} strokeWidth={2.2} />
          </div>
        </div>
      </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.018, boxShadow: "0 10px 28px rgba(0,0,0,0.09)" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[22px]"
    >
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] bg-[#efefef]"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] backdrop-blur-sm">
          {article.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.78rem] text-[var(--muted)]">
          {article.date} · {article.readTime}
        </p>
        <h3 className="mt-2 text-[1.05rem] font-extrabold leading-snug tracking-tight text-[var(--foreground)]">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-[0.88rem] leading-6 text-[var(--muted)] line-clamp-3">
          {article.summary}
        </p>

        <div className="mt-5 flex items-center gap-1.5 text-[0.85rem] font-semibold text-[var(--primary)] transition group-hover:gap-2.5">
          Read More
          <ArrowRight size={14} strokeWidth={2.2} />
        </div>
      </div>
    </Link>
    </motion.div>
  );
}
