"use client";

import { testimonials } from "@/lib/site-data";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export function Testimonials() {
    return (
        <section id="testimonials" className="section-block relative overflow-hidden">
            <div className="ambient-orb right-[-8rem] top-16 h-[28rem] w-[28rem] bg-[#5C0F31]/35" />
            <div className="ambient-orb left-[-6rem] bottom-10 h-[24rem] w-[24rem] bg-[#D4AF37]/12" />
            <div className="site-shell relative z-10">
                <SectionHeader
                    eyebrow="Success Stories"
                    title="Real Couples, Real"
                    accent="Stories"
                    description="The strongest sign of product quality is what happens after the first message. These are serious outcomes from serious users."
                />

                {/* Featured big testimonial */}
                <motion.div
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="premium-panel-gold relative mb-8 overflow-hidden p-8 sm:p-12"
                >
                    <div className="absolute -left-6 -top-6 font-display text-[10rem] font-bold leading-none text-[#D4AF37]/10">
                        &ldquo;
                    </div>
                    <div className="relative z-10 mx-auto max-w-3xl text-center">
                        <div className="mb-5 flex justify-center gap-1 text-[#D4AF37]">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon key={i} className="h-5 w-5" />
                            ))}
                        </div>
                        <p className="font-display text-xl italic leading-[1.7] text-white/88 sm:text-2xl lg:text-[1.65rem]">
                            &ldquo;{testimonials[0].text}&rdquo;
                        </p>
                        <div className="mt-7 flex items-center justify-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#BF953F] text-sm font-black text-[#1A000A]">
                                {testimonials[0].initials}
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white">{testimonials[0].name}</div>
                                <div className="text-xs text-white/50">{testimonials[0].city}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Other testimonials */}
                <div className="grid gap-5 md:grid-cols-3">
                    {testimonials.slice(1).map((item, i) => (
                        <motion.article
                            key={item.name}
                            initial={false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            className="premium-panel is-hoverable flex h-full flex-col p-7"
                        >
                            <div className="flex gap-0.5 text-[#D4AF37]">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <StarIcon key={j} className="h-4 w-4" />
                                ))}
                            </div>
                            <p className="mt-5 flex-1 text-sm leading-7 text-white/65">
                                &ldquo;{item.text}&rdquo;
                            </p>
                            <div className="mt-6 flex items-center gap-3 border-t border-white/6 pt-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#5C0F31] to-[#8B1A4A] text-xs font-bold text-white">
                                    {item.initials}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{item.name}</div>
                                    <div className="mt-0.5 text-xs text-white/45">{item.city}</div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
