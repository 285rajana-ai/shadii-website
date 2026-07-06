import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";

const columns = [

    {
        title: "Explore",
        links: [
            { href: "#about", label: "Why Shadii.pk" },
            { href: "#journey", label: "How It Works" },
            { href: "#plans", label: "Pricing" },
            { href: "#stories", label: "Success Stories" },
        ],
    },
    {
        title: "Support",
        links: [
            { href: "#faq", label: "Common Questions" },
            { href: "mailto:help@shadii.pk", label: "help@shadii.pk" },
            { href: "mailto:safety@shadii.pk", label: "safety@shadii.pk" },
            { href: "mailto:payments@shadii.pk", label: "payments@shadii.pk" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "#download", label: "Download App" },
            { href: "#plans", label: "Subscription Plans" },
            { href: "#about", label: "Privacy Promise" },
            { href: "#stories", label: "For Families" },
        ],
    },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="section pb-10 pt-8">
            <div className="site-shell">
                {/* Filigree Ornament Divider */}
                <div className="w-full flex items-center justify-center gap-4 py-8 text-[var(--gold)] opacity-40 mb-10 select-none pointer-events-none">
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
                        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--berry)]">
                            <span>CNIC Verified</span>
                            <span className="text-[var(--gold)] select-none">•</span>
                            <span>Private Messaging</span>
                            <span className="text-[var(--gold)] select-none">•</span>
                            <span>Family Friendly</span>
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
                        <Link href="/terms" className="transition-colors hover:text-[var(--text)]">
                            Terms of Service
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
