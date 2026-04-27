"use client";

import { faqs } from "@/lib/site-data";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "../ui/SectionHeader";

export function FAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="section-block section-alt relative overflow-hidden">
            <div className="ambient-orb left-[-4rem] top-28 h-[20rem] w-[20rem] bg-[#5C0F31]/15" />
            <div className="site-shell relative z-10">
                <SectionHeader
                    eyebrow="FAQ"
                    title="Common"
                    accent="Questions"
                    description="Everything you need to know about using Shadii.pk for a serious, safe matrimonial experience."
                />
                <div className="mx-auto max-w-3xl">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: i * 0.04 }}
                            className="border-b border-white/8"
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(open === i ? null : i)}
                                className="flex w-full items-center justify-between gap-6 py-6 text-left"
                                aria-expanded={open === i}
                            >
                                <span className="text-base font-semibold text-white">{faq.q}</span>
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${open === i ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]" : "border-white/12 bg-white/4 text-white/50"}`}>
                                    <ChevronDownIcon
                                        className={`h-4 w-4 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                                    />
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {open === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-6 text-sm leading-7 text-white/60">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
