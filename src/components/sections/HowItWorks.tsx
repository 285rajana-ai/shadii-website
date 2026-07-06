"use client";

import { steps } from "@/lib/site-data";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export function HowItWorks() {
    return (
        <section id="how-it-works" className="section-block section-alt relative overflow-hidden">
            <div className="ambient-orb left-[-6rem] top-28 h-[26rem] w-[26rem] bg-[#5C0F31]/35" />
            <div className="ambient-orb right-[-4rem] bottom-10 h-[22rem] w-[22rem] bg-[#D4AF37]/12" />
            <div className="site-shell relative z-10">
                <SectionHeader
                    eyebrow="Simple Process"
                    title="Your Journey to"
                    accent="Finding Love"
                    description="From signup to serious family conversations, every step is designed to feel intentional and low-friction."
                />
                <div className="relative grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Connecting line on desktop */}
                    <div className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent xl:block" />

                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.num}
                                initial={false}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
                                className="premium-panel is-hoverable group relative p-7"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="relative">
                                        <div className="icon-tile icon-tile-lg transition-all duration-500 group-hover:scale-110">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#BF953F] text-[11px] font-black text-[#1A000A] shadow-[0_6px_16px_rgba(212,175,55,0.45)]">
                                            {step.num}
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <h3 className="font-display text-xl font-bold leading-snug text-white">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-white/58">{step.desc}</p>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
