"use client";

import { trustBadges } from "@/lib/site-data";
import { motion } from "framer-motion";

export function Trust() {
    return (
        <section className="relative overflow-hidden border-y border-white/10 py-10 sm:py-14" style={{ background: 'linear-gradient(180deg, rgba(92,15,49,0.12) 0%, rgba(10,10,11,0.9) 100%)' }}>
            <div className="site-shell">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {trustBadges.map((badge, i) => {
                        const Icon = badge.icon;
                        return (
                            <motion.div
                                key={badge.title}
                                initial={false}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm"
                            >
                                <div className="icon-tile shrink-0">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{badge.title}</div>
                                    <p className="mt-1 text-xs leading-6 text-white/55">{badge.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
