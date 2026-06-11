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
        <footer className="section section-rule pb-10 pt-14">
            <div className="site-shell">
                <div className="grid gap-12 lg:grid-cols-[1.15fr_repeat(3,minmax(0,1fr))]">
                    <div>
                        <BrandMark />
                        <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted)]">
                            Built for serious Pakistani matchmaking with privacy-first profiles, clean design,
                            and a calmer path from first introduction to family conversation.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            <span className="rounded-full border border-[var(--line-strong)] bg-white/50 px-3 py-2">CNIC Verified</span>
                            <span className="rounded-full border border-[var(--line-strong)] bg-white/50 px-3 py-2">Private Messaging</span>
                            <span className="rounded-full border border-[var(--line-strong)] bg-white/50 px-3 py-2">Family Friendly</span>
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
