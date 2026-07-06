"use client";

import { features } from "@/lib/site-data";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export function Features() {
  return (
    <section id="features" className="section-block relative overflow-hidden">
      <div className="ambient-orb right-[-8rem] top-32 h-[28rem] w-[28rem] bg-[#5C0F31]/40" />
      <div className="ambient-orb left-[-6rem] bottom-0 h-[24rem] w-[24rem] bg-[#8B1A4A]/25" />
      <div className="site-shell relative z-10">
        <SectionHeader
          eyebrow="Why Shadii.pk"
          title="Everything You Need to"
          accent="Find Your Match"
          description="Designed for real Pakistani matchmaking — premium design, clear trust signals, and features that reduce noise instead of adding it."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                className="premium-panel is-hoverable group relative flex h-full flex-col p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-tile icon-tile-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="chip">{feature.badge}</div>
                </div>
                <h3 className="mt-7 font-display text-xl font-bold leading-snug text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{feature.desc}</p>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
