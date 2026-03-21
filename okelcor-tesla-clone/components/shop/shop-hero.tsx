export default function ShopHero() {
  return (
    <section className="w-full pt-[76px] lg:pt-20">
      <div className="relative h-[44vh] min-h-[280px] max-h-[460px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/dc/90/4f/dc904f8419388febd6e7783a53662cf2.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            Our Catalogue
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Premium Tyres for Global Supply
          </h1>
          <p className="mt-4 max-w-xl text-[1rem] leading-7 text-white/80">
            PCR, TBR, OTR, and used tyres from the world&apos;s most trusted brands.
          </p>
        </div>
      </div>
    </section>
  );
}
