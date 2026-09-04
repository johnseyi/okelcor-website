/**
 * The shared page header: a compact ink band in the site's own design
 * language. It replaced a 62vh photo hero with a Reveal animation that every
 * inner page carried — seven pages of full-screen stock imagery before any
 * content, which is the single biggest reason the site read as generated.
 *
 * Props are unchanged so no call site had to move. `image` is accepted and
 * deliberately unused; the photos live on in the content sections where
 * they mean something.
 */

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
};

export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section
      className="w-full bg-[#171a20]"
      style={{ paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-14">
        <p className="text-[0.78rem] font-semibold text-[#ff7434]">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[1rem] leading-relaxed text-white/65">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
