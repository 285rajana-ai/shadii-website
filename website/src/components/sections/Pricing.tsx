"use client";

import { plans } from "@/lib/site-data";
import { CheckIcon, RocketLaunchIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export function Pricing() {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "/portal";

  return (
    <section id="pricing" className="section-block section-alt relative overflow-hidden">
      <div className="ambient-orb right-[-10rem] top-20 h-[30rem] w-[30rem] bg-[#D4AF37]/14" />
      <div className="ambient-orb left-[-8rem] bottom-10 h-[24rem] w-[24rem] bg-[#5C0F31]/30" />
      <div className="site-shell relative z-10">
        <SectionHeader
          eyebrow="Affordable Plans"
          title="Simple, Honest"
          accent="Pricing"
          description="First message is free. When you are ready to move seriously, paid plans unlock privacy and visibility tools that actually matter."
        />
        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative flex h-full flex-col rounded-[2rem] p-8 transition-transform duration-500 hover:-translate-y-2 ${plan.popular
                ? "premium-panel-gold"
                : "premium-panel"
                }`}
            >
              {plan.popular && (
                <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#BF953F] px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#1A000A] shadow-[0_12px_30px_rgba(212,175,55,0.4)]">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                  {plan.name}
                </div>
                <p className="mt-2 text-sm text-white/55">{plan.tagline}</p>
                <div className="mt-6 flex items-end gap-2 text-white">
                  <span className="mb-2 text-sm font-semibold text-white/40">PKR</span>
                  <span className="font-display text-[3.5rem] font-bold leading-none tracking-[-0.04em]">
                    {plan.price}
                  </span>
                </div>
                <div className="mt-2 text-sm text-white/55">for {plan.duration}</div>
              </div>

              <div className="my-7 shimmer-divider" />

              <ul className="flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-white/72"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/12 text-[#D4AF37]">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${portalUrl}/register?plan=${plan.name.toLowerCase() === "premium" ? "premium" : "free"}`}
                className={
                  plan.popular
                    ? "button-primary mt-8 w-full py-4 text-sm"
                    : "button-secondary mt-8 w-full py-4 text-sm"
                }
              >
                Get Started
              </a>
            </motion.article>
          ))}
        </div>

        {/* Boost add-on */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 overflow-hidden rounded-[2rem] border border-[#FF6B35]/25 bg-[linear-gradient(135deg,rgba(255,107,53,0.14),rgba(26,26,26,0.92))] px-6 py-7 sm:px-10 lg:px-12"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35]/30 to-[#FF9F6D]/10 text-[#FF9F6D]">
                <RocketLaunchIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">
                  Profile Boost Add-on
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
                  Push your profile to the top of search results for 3 days and increase
                  visibility during the most important first-impression window.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-left md:text-right">
              <div className="font-display text-4xl font-bold text-[#FF9F6D]">
                PKR 500
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
                Per 3 days
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
