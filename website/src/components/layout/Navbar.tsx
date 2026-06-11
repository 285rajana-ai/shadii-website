"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { BrandMark } from "../ui/BrandMark";

const links = [
    { href: "#about", label: "About" },
    { href: "#journey", label: "Journey" },
    { href: "#plans", label: "Plans" },
    { href: "#stories", label: "Stories" },
    { href: "#faq", label: "FAQ" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 16);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div className="site-shell pt-4">
                <div
                    className={[
                        "nav-shell flex items-center justify-between gap-4 rounded-[1.6rem] border px-4 py-3 transition-all sm:px-5",
                        scrolled
                            ? "border-[var(--gold)]/35 bg-[rgba(26,4,8,0.85)] shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                            : "border-white/10 bg-[rgba(26,4,8,0.4)] backdrop-blur-md",
                    ].join(" ")}
                >
                    <div className="sm:hidden">
                        <BrandMark compact lightText />
                    </div>
                    <div className="hidden sm:block">
                        <BrandMark lightText />
                    </div>
 
                    <nav className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link rounded-full px-4 py-2 text-sm font-semibold text-stone-200 transition-colors hover:text-[var(--gold)]"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
 
                    <div className="hidden items-center gap-3 lg:flex">
                        <a href="#plans" className="inline-flex items-center justify-center min-h-[2.6rem] rounded-full px-5 text-xs font-bold border border-[var(--gold)]/40 bg-transparent text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all">
                            View Plans
                        </a>
                        <a href="#download" className="inline-flex items-center justify-center min-h-[2.6rem] rounded-full px-5 text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[#1a0307] hover:shadow-[0_0_20px_rgba(194,155,80,0.4)] transition-all">
                            Download App
                        </a>
                    </div>
 
                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--gold)]/30 bg-[rgba(255,255,255,0.08)] text-stone-200 lg:hidden"
                    >
                        {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                    </button>
                </div>
 
                {open && (
                    <div className="menu-panel mt-3 rounded-[1.6rem] border border-[var(--gold)]/30 bg-[rgba(26,4,8,0.96)] p-4 shadow-2xl backdrop-blur-2xl lg:hidden">
                        <nav className="flex flex-col gap-1">
                            {links.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-2xl px-4 py-3 text-sm font-medium text-stone-200 transition-colors hover:bg-white/5 hover:text-[var(--gold)]"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4">
                            <a href="#plans" onClick={() => setOpen(false)} className="inline-flex items-center justify-center min-h-[2.8rem] rounded-full px-5 text-sm font-bold border border-[var(--gold)]/40 bg-transparent text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all text-center justify-center">
                                View Plans
                            </a>
                            <a href="#download" onClick={() => setOpen(false)} className="inline-flex items-center justify-center min-h-[2.8rem] rounded-full px-5 text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] text-[#1a0307] hover:shadow-[0_0_20px_rgba(194,155,80,0.4)] transition-all text-center justify-center">
                                Download App
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>

    );
}
