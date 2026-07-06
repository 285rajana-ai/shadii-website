"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

export function Download() {
    return (
        <section id="download" className="section-block relative overflow-hidden">
            {/* Centered ambient glow */}
            <div className="ambient-orb left-1/2 top-0 h-[32rem] w-[56rem] -translate-x-1/2 bg-gradient-to-r from-[#5C0F31]/20 via-[#8B1A4A]/15 to-[#D4AF37]/10" />
            <div className="site-shell relative z-10">
                <SectionHeader
                    eyebrow="Download App"
                    title="Start Your Journey"
                    accent="Today"
                    description="Free to download. First message is free. Find the person your family has been waiting to meet."
                />
                <motion.div
                    initial={false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    {/* App Store */}
                    <a href="#" className="download-badge gap-4">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 fill-white" aria-hidden="true">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <span>
                            <small>Download on the</small>
                            <strong>App Store</strong>
                        </span>
                    </a>
                    {/* Google Play */}
                    <a href="#" className="download-badge gap-4">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 fill-white" aria-hidden="true">
                            <path d="M3.18 23.76c.33.18.72.2 1.08.01l11.49-6.42L12.6 14.2l-9.42 9.56zm-1.22-20.3C1.7 3.8 1.5 4.28 1.5 4.86v14.28c0 .58.2 1.06.46 1.4l.07.06L9.37 13v-.18L2.03 3.4l-.07.06zm13.92 9.75L13.7 11l3.18-3.21 3.95 2.2c1.13.63 1.13 1.66 0 2.29l-3.95 2.2v-.07zM4.26.23C3.9.04 3.51.06 3.18.24l9.45 9.56 3.14-3.14L4.26.23z" />
                        </svg>
                        <span>
                            <small>Get it on</small>
                            <strong>Google Play</strong>
                        </span>
                    </a>
                </motion.div>

                {/* Bottom note */}
                <motion.p
                    initial={false}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-8 flex items-center justify-center gap-2 text-sm text-white/40"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Free download · No card required · First message free
                </motion.p>
            </div>
        </section>
    );
}
