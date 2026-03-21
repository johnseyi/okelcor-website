"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
};

const slides: Slide[] = [
  {
    title: "PREMIUM TYRE SOURCING",
    subtitle:
      "High-quality tyres for distributors, wholesalers, and global buyers",
    image:
      "https://static.wixstatic.com/media/0e688a_7f22e0aa01f94ef08923641df8c5c7bc~mv2.jpg/v1/fill/w_1777,h_2000,al_r,q_90,enc_avif,quality_auto/0e688a_7f22e0aa01f94ef08923641df8c5c7bc~mv2.jpg",
  },
  {
    title: "USED TYRES YOU CAN TRUST",
    subtitle:
      "Reliable, cost-effective supply for multiple international markets",
    image:
      "https://static.wixstatic.com/media/c3023e_bedc998c5fe249daaf0ee7ba159cb9fb~mv2.png/v1/fill/w_823,h_768,al_c,q_90,enc_avif,quality_auto/c3023e_bedc998c5fe249daaf0ee7ba159cb9fb~mv2.png",
  },
  {
    title: "TBR TYRES FOR LOGISTICS",
    subtitle:
      "Built for transport, durability, and dependable commercial performance",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2200&q=80",
  },
];

export default function Hero() {
  const [index, setIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 60]);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const prev = (): void => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const next = (): void => {
    setIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const slide = slides[index];

  return (
    <section className="w-full pt-20">
      <div className="relative h-[82vh] min-h-[560px] max-h-[700px] overflow-hidden md:h-[77vh] md:max-h-[720px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0.76, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.72, scale: 1.01 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 scale-[1.04] bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url("${slide.image}")`, y: parallaxY }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/24" />

        <button
          type="button"
          onClick={prev}
          className="hero-nav-btn absolute left-8 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={next}
          className="hero-nav-btn absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>

        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-8 text-center md:px-10 md:pb-8 md:pt-12">
          <div className="flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: -14 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mx-auto flex w-full max-w-5xl flex-col items-center"
              >
                <h1 className="hero-title max-w-5xl text-white">
                  {slide.title}
                </h1>

                <p className="hero-subtitle mt-3 max-w-4xl text-white">
                  {slide.subtitle}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/quote" className="tesla-hero-btn-primary">
                    Leave us your inquiry
                  </Link>
                  <Link href="/shop" className="tesla-hero-btn-secondary">
                    View our catalogue
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex w-full items-end justify-between">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="hero-control-btn hidden md:inline-flex"
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            <div className="mx-auto flex items-center gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`hero-dot ${i === index ? "hero-dot-active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="hidden w-[42px] md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}