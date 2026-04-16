import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FetTeaser() {
  return (
    <section className="w-full border-y border-[#e2e8e2] bg-[#f0f4f0] py-10">
      <div className="tesla-shell flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">

        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center self-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#166534] sm:self-start">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            Also Available
          </span>
          <h2 className="text-[1.15rem] font-extrabold leading-snug tracking-tight text-[#111111] sm:text-[1.25rem]">
            Fuel Echo Tech —{" "}
            <span className="text-[#22c55e]">Save Fuel. Improve Performance.</span>
          </h2>
          <p className="max-w-[480px] text-[0.85rem] leading-6 text-[#6b7280]">
            The fuel efficiency device trusted by fleet operators across Europe. Up to 15% fuel savings.
          </p>
        </div>

        <Link
          href="/fet"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#22c55e] px-6 py-3 text-[0.88rem] font-semibold text-white shadow-[0_8px_24px_rgba(34,197,94,0.25)] transition hover:bg-[#16a34a]"
        >
          Learn More <ArrowRight size={15} strokeWidth={2} />
        </Link>

      </div>
    </section>
  );
}
