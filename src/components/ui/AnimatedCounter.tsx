"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    decimals?: number;
    duration?: number;
}

export function AnimatedCounter({
    value,
    suffix = "",
    decimals = 0,
    duration = 2000,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start: number | null = null;
        let raf = 0;

        const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, value, duration]);

    const formatted =
        decimals > 0
            ? display.toFixed(decimals)
            : Math.floor(display).toLocaleString("en-US");

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            className="gradient-text"
        >
            {formatted}
            {suffix}
        </motion.span>
    );
}
