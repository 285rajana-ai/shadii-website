"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
    eyebrow: string;
    title: string;
    accent?: string;
    description?: string;
    align?: "left" | "center";
}

export function SectionHeader({
    eyebrow,
    title,
    accent,
    description,
    align = "center",
}: SectionHeaderProps) {
    const alignment = align === "left" ? "items-start text-left" : "items-center text-center mx-auto";

    return (
        <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`section-header ${alignment}`}
        >
            <div className="section-eyebrow">{eyebrow}</div>
            <h2 className="section-title">
                {title}
                {accent ? (
                    <>
                        {" "}
                        <span className="gradient-text italic">{accent}</span>
                    </>
                ) : null}
            </h2>
            {description ? <p className="section-copy">{description}</p> : null}
        </motion.div>
    );
}
