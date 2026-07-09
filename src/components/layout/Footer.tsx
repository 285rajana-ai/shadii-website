import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";

const columns = [
    {
        title: "Explore",
        links: [
            { href: "/#about", label: "Why Shadii.pk" },
            { href: "/#journey", label: "How It Works" },
            { href: "/#plans", label: "Pricing" },
            { href: "/#stories", label: "Success Stories" },
        ],
    },
    {
        title: "Support",
        links: [
            { href: "/#faq", label: "Common Questions" },
            { href: "/contact-us", label: "Contact Us" },
            { href: "mailto:help@shadii.pk", label: "help@shadii.pk" },
            { href: "mailto:support@shadii.pk", label: "support@shadii.pk" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "/#download", label: "Download App" },
            { href: "/#plans", label: "Subscription Plans" },
            { href: "/privacy-policy", label: "Privacy Policy" },
            { href: "/terms-and-conditions", label: "Terms & Conditions" },
            { href: "/refund-policy", label: "Refund Policy" },
        ],
    },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="liquid-glass liquid-glass-glow py-16 shadow-2xl relative overflow-hidden border-t border-[var(--line)] w-full mt-24">
            <div className="site-shell">
                {/* Filigree Ornament Divider */}
                <div className="w-full flex items-center justify-center gap-4 py-4 text-[var(--gold)] opacity-40 mb-10 select-none pointer-events-none">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--gold)]" />
                    <svg className="w-16 h-6" viewBox="0 0 100 24" fill="currentColor">
                        <path d="M50,12 C40,4 35,4 30,12 C25,20 20,20 10,12 C5,8 2,12 0,12 C0,12 5,16 10,12 C20,4 25,4 30,12 C35,20 40,20 50,12 Z" />
                        <circle cx="50" cy="12" r="3" />
                        <path d="M50,12 C60,4 65,4 70,12 C75,20 80,20 90,12 C95,8 98,12 100,12 C100,12 95,16 90,12 C80,4 75,4 70,12 C65,20 60,20 50,12 Z" />
                    </svg>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--gold)]" />
                </div>

                <div className="grid gap-12 lg:grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]">
                    <div>
                        <BrandMark />
                        <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted)]">
                            Built for serious Pakistani matchmaking with privacy-first profiles, clean design,
                            and a calmer path from first introduction to family conversation.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <a
                                href="https://facebook.com/shadii.pk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110"
                                aria-label="Facebook"
                            >
                                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/shadii.pk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110"
                                aria-label="Instagram"
                            >
                                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.tiktok.com/@shadii.pk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110"
                                aria-label="TikTok"
                            >
                                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.18 1.12 1.22 2.68 1.95 4.3 2.1v3.91c-1.88-.04-3.7-.65-5.23-1.77-.07-.05-.12-.1-.21-.18v7.41c.02 2.22-.73 4.41-2.18 6.05-1.81 2.08-4.59 3.19-7.33 2.94-3.15-.22-6.07-2.38-7.07-5.41-1.27-3.78.29-8.19 3.77-10.05 1.46-.81 3.14-1.12 4.79-.88v4c-1.16-.31-2.45-.07-3.39.69-.97.77-1.42 2.05-1.17 3.26.29 1.46 1.59 2.54 3.08 2.54 1.77.03 3.25-1.4 3.26-3.17V.02z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {columns.map((column) => (
                        <div key={column.title}>
                            <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--berry)]">
                                {column.title}
                            </div>
                            <div className="mt-5 grid gap-3">
                                {column.links.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--berry)]"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} Shadii.pk. All rights reserved.</p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/privacy" className="transition-colors hover:text-[var(--text)]">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-and-conditions" className="transition-colors hover:text-[var(--text)]">
                            Terms & Conditions
                        </Link>
                        <Link href="/refund-policy" className="transition-colors hover:text-[var(--text)]">
                            Refund Policy
                        </Link>
                        <Link href="/contact-us" className="transition-colors hover:text-[var(--text)]">
                            Contact Us
                        </Link>
                        <Link href="/delete-account" className="transition-colors hover:text-[var(--text)]">
                            Account Deletion
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
