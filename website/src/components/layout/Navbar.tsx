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
                            ? "border-white/12 bg-[#130d10]/80 shadow-[0_20px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
                            : "border-white/8 bg-white/[0.03] backdrop-blur-xl",
                    ].join(" ")}
                >
                    <div className="sm:hidden">
                        <BrandMark compact />
                    </div>
                    <div className="hidden sm:block">
                        <BrandMark />
                    </div>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link rounded-full px-4 py-2 text-sm font-medium text-white/68 transition-colors hover:text-[#f2dcc0]"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <a href="#plans" className="btn-secondary px-5 text-sm">
                            View Plans
                        </a>
                        <a href="#download" className="btn-primary px-5 text-sm">
                            Download App
                        </a>
                    </div>

                    <button
                        type="button"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-white lg:hidden"
                    >
                        {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                    </button>
                </div>

                {open && (
                    <div className="menu-panel mt-3 rounded-[1.6rem] border border-white/10 bg-[#120d10]/95 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:hidden">
                        <nav className="flex flex-col gap-1">
                            {links.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.05]"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-4 grid gap-3 border-t border-white/8 pt-4">
                            <a href="#plans" onClick={() => setOpen(false)} className="btn-secondary w-full text-sm">
                                View Plans
                            </a>
                            <a href="#download" onClick={() => setOpen(false)} className="btn-primary w-full text-sm">
                                Download App
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
