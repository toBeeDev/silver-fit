import Link from "next/link";
import Button from "@/components/ui/Button";
import AnimatedHero from "@/components/ui/animated-hero";
import { Testimonial } from "@/components/ui/design-testimonial";
import Footer from "@/components/layout/Footer";
import { getBenefits } from "@/lib/welfare-api";
import { MoveRight } from "lucide-react";

export default function HomePage() {
  const { benefits } = getBenefits(1, 3);

  return (
    <div className="-mt-16">
      {/* Section 1: Hero — full viewport */}
      <section className="full-section relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/97" />
        <div className="relative z-10 flex flex-1 w-full items-center">
          <AnimatedHero />
        </div>
      </section>

      {/* Section 2: 주요 복지혜택 */}
      <section className="full-section relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/benefits-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/95" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:gap-16 sm:py-0">
          {/* Left column — heading + CTA */}
          <div className="shrink-0 sm:w-[260px]">
            <span className="text-xs font-medium uppercase tracking-widest text-sub-text">
              Popular Benefits
            </span>
            <h2 className="mt-4 text-3xl font-normal tracking-tight text-foreground sm:text-4xl md:text-5xl">
              주요
              <br />
              복지혜택
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-sub-text">
              가장 많이 찾는
              <br className="hidden sm:block" />
              부모님 복지혜택을 확인하세요
            </p>
            <div className="mt-8 hidden sm:block">
              <Link href="/benefits">
                <Button variant="outline" className="gap-4">
                  전체 혜택 보기 <MoveRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column — benefit list */}
          <div className="w-full flex-1">
            {benefits.map((benefit, i) => (
              <Link
                key={benefit.id}
                href={`/benefits/${benefit.slug}`}
                className="group flex items-center gap-5 border-b border-border/60 py-7 transition-colors first:border-t hover:bg-white/40 sm:gap-6 sm:py-8"
              >
                <span className="w-[60px] shrink-0 text-4xl font-extralight tabular-nums text-primary-200 sm:w-[72px] sm:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-0.5 text-xs font-medium text-sub-text">
                    <span className="h-1 w-1 rounded-full bg-primary-600" />
                    {benefit.category}
                  </span>
                  <h3 className="mt-2 text-[20px] font-medium leading-tight text-foreground transition-colors group-hover:text-primary-700 sm:text-[22px]">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-[15px] text-sub-text">
                    {benefit.summary}
                  </p>
                  <span className="mt-1.5 inline-block text-[14px] font-semibold text-primary-700">
                    {benefit.amount}
                  </span>
                </div>
                <MoveRight className="hidden h-4 w-4 shrink-0 translate-x-0 text-sub-text opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:block" />
              </Link>
            ))}

            {/* Mobile CTA */}
            <div className="mt-8 sm:hidden">
              <Link href="/benefits">
                <Button variant="outline" className="w-full gap-4">
                  전체 혜택 보기 <MoveRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 이용 후기 + Footer */}
      <section className="full-section-end relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/testimonial-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/95" />
        <div className="relative z-10 flex flex-1 flex-col">
          <Testimonial />
          <Footer />
        </div>
      </section>
    </div>
  );
}
