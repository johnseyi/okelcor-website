import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FetTeaser() {
  return (
    <section className="w-full bg-[#1a1a1a] py-10">
      <div className="tesla-shell flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">

        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center self-center rounded-full bg-[#10b981]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#10b981] sm:self-start">
            Also Available
          </span>
          <h2 className="text-[1.15rem] font-extrabold leading-snug tracking-tight text-white sm:text-[1.25rem]">
            FET Engine Treatment —{" "}
            <span className="text-[#10b981]">Save Fuel. Improve Performance.</span>
          </h2>
          <p className="max-w-[480px] text-[0.85rem] leading-6 text-white/55">
            The fuel efficiency additive trusted by fleet operators across Europe. Up to 15% fuel savings.
          </p>
        </div>

        <Link
          href="/fet"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-6 py-3 text-[0.88rem] font-semibold text-[#10b981] transition hover:bg-[#10b981]/20"
        >
          Learn More <ArrowRight size={15} strokeWidth={2} />
        </Link>

      </div>
    </section>
  );
}
