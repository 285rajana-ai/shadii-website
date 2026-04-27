"use client";

import { stats } from "@/lib/site-data";
import { motion } from "framer-motion";
import { AnimatedCounter } from "../ui/AnimatedCounter";

export function Stats() {

// ... existing code ...
    return (
        <section className="relative overflow-hidden border-b border-white/8 py-12 sm:py-16" style={{ background: 'rgba(8,8,10,0.85)' }}>
            <div className="site-shell">
                <div className="premium-panel grid gap-0 overflow-hidden p-0 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="relative flex flex-col gap-2 px-8 py-10 lg:py-12"
                        >
                            <div className="font-display text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
                                <AnimatedCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    decimals={stat.decimals ?? 0}
                                />
                            </div>
                            <div className="text-sm font-medium text-white/55">{stat.label}</div>
                            {i < stats.length - 1 && (
                                <div className="absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/10 lg:block" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
