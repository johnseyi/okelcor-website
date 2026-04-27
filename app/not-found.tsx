import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer";

export default function NotFound() {
  return (
    <main>
      {/* Minimal header — avoids depending on context providers that may be absent */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-black/[0.04] bg-white/96 backdrop-blur-xl">
        <div className="tesla-shell flex h-[76px] items-center lg:h-20">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="/logo/okelcor-logo.png"
              alt="Okelcor"
              width={120}
              height={22}
              priority
              style={{ height: "22px", width: "auto" }}
              className="object-contain"
            />
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#E85C1A]">
              Growing Together
            </span>
          </Link>
        </div>
      </header>

      <section className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f5f5f5] px-6 pt-20 text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
          404
        </p>

        <h1 className="mt-4 max-w-2xl text-5xl font-extrabold tracking-tight text-[var(--foreground)] md:text-6xl">
          Page not found.
        </h1>

        <p className="mt-5 max-w-md text-[1.05rem] leading-7 text-[var(--muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[46px] items-center justify-center rounded-full bg-[var(--primary)] px-8 text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-[46px] items-center justify-center rounded-full border border-black/10 bg-white px-8 text-[0.95rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
          >
            Browse Catalogue
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
