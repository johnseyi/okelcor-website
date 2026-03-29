"use client";

import { MessageCircle, Truck, Headphones } from "lucide-react";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const ICONS: LucideIcon[] = [MessageCircle, Truck, Headphones];

export default function Services() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-[#f5f5f5] py-8">
      <div className="tesla-shell">

        {/* Section header */}
        <Reveal className="mb-8 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            {t.about.services.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
            {t.about.services.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-7 text-[var(--muted)]">
            {t.about.services.subtitle}
          </p>
        </Reveal>

        {/* Cards */}
        <StaggerParent className="grid gap-5 md:grid-cols-3">
          {t.about.services.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
            <StaggerChild key={item.eyebrow}>
            <div
              className="flex flex-col rounded-[22px] bg-[#efefef] p-6 sm:p-8"
            >
              {/* Icon */}
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--primary)]/10">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  className="text-[var(--primary)]"
                />
              </div>

              {/* Label */}
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                {item.eyebrow}
              </p>

              {/* Heading */}
              <h3 className="mt-2 text-[1.18rem] font-extrabold leading-snug text-[var(--foreground)]">
                {item.heading}
              </h3>

              {/* Body */}
              <p className="mt-3 flex-1 text-[0.93rem] leading-7 text-[var(--muted)]">
                {item.body}
              </p>
            </div>
            </StaggerChild>
            );
          })}
        </StaggerParent>

      </div>
    </section>
  );
}
