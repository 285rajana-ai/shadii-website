import type { Metadata } from "next";
import Link from "next/link";
import { EnvelopeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Shadii.pk customer support. Contact us for profile verification, payment assistance, safety audits, and general matrimonial platform help.",
    keywords: [
        "contact shadii.pk",
        "shadii.pk support number",
        "shadii.pk address",
        "pakistani rishta contact bureau",
        "lahore marriage bureau office"
    ],
};

const contactCards = [
    {
        label: "Support Emails",
        value: "help@shadii.pk / support@shadii.pk",
        href: "mailto:help@shadii.pk",
        icon: EnvelopeIcon,
    },
    {
        label: "Contact Number",
        value: businessInfo.contactNumber,
        href: businessInfo.contactNumber.startsWith("Pending") ? undefined : `tel:${businessInfo.contactNumber.replace(/\s/g, "")}`,
        icon: PhoneIcon,
    },
    {
        label: "Business Address",
        value: businessInfo.businessAddress,
        icon: MapPinIcon,
    },
    {
        label: "Website",
        value: businessInfo.website,
        href: businessInfo.website,
        icon: GlobeAltIcon,
    },
];

export default function ContactUsPage() {
    return (
        <main className="min-h-screen flex flex-col justify-between">
            <Navbar />

            <div className="flex-1 flex flex-col justify-center my-12">
                <div className="site-shell max-w-5xl relative z-10 pt-28 pb-10">
                    <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                        <div className="eyebrow mb-4">Shadii.pk Support</div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                            Contact Us
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                            For account support, billing questions, privacy requests, safety reports, or merchant queries, contact
                            Shadii.pk through the official details below.
                        </p>
                        <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: {businessInfo.lastUpdated}</p>
                    </div>

                    <section className="grid gap-5 md:grid-cols-2">
                        {contactCards.map((card) => {
                            const Icon = card.icon;
                            const content = (
                                <div className="luxury-card h-full transition-transform hover:-translate-y-1">
                                    <div className="flex items-start gap-4">
                                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--berry)] text-white">
                                            <Icon className="h-6 w-6" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--berry)]">
                                                {card.label}
                                            </h2>
                                            <p className="mt-3 text-base font-semibold leading-7 text-[var(--text)]">
                                                {card.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );

                            return card.href ? (
                                <a key={card.label} href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                                    {content}
                                </a>
                            ) : (
                                <div key={card.label}>{content}</div>
                            );
                        })}
                    </section>

                    <section className="luxury-card mt-8">
                        <h2 className="text-xl font-bold text-[var(--berry)]">Support hours and response</h2>
                        <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                            We review support and help queries as quickly as possible. Payment, subscription, or safety reports
                            should include the registered email address, plan name, and relevant transaction/ticket details.
                        </p>
                        <div className="mt-6 grid gap-3 text-sm font-medium text-[var(--muted)] sm:grid-cols-2">
                            <p>General help: <a className="text-[var(--berry)] hover:underline" href="mailto:help@shadii.pk">help@shadii.pk</a></p>
                            <p>Technical support: <a className="text-[var(--berry)] hover:underline" href="mailto:support@shadii.pk">support@shadii.pk</a></p>
                        </div>
                    </section>

                    <section className="luxury-card mt-8 flex flex-col items-center text-center">
                        <h2 className="text-xl font-bold text-[var(--berry)]">Follow Us on Social Media</h2>
                        <p className="mt-2 text-sm text-[var(--muted)]">Stay updated with matches, success stories, and safety tips.</p>
                        <div className="mt-6 flex items-center gap-6">
                            <a
                                href="https://facebook.com/shadii.pk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110 shadow-sm"
                                aria-label="Facebook"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/shadii.pk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110 shadow-sm"
                                aria-label="Instagram"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.tiktok.com/@shadii.pk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--berry)]/5 text-[var(--berry)] transition-all hover:bg-[var(--berry)] hover:text-white hover:scale-110 shadow-sm"
                                aria-label="TikTok"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.18 1.12 1.22 2.68 1.95 4.3 2.1v3.91c-1.88-.04-3.7-.65-5.23-1.77-.07-.05-.12-.1-.21-.18v7.41c.02 2.22-.73 4.41-2.18 6.05-1.81 2.08-4.59 3.19-7.33 2.94-3.15-.22-6.07-2.38-7.07-5.41-1.27-3.78.29-8.19 3.77-10.05 1.46-.81 3.14-1.12 4.79-.88v4c-1.16-.31-2.45-.07-3.39.69-.97.77-1.42 2.05-1.17 3.26.29 1.46 1.59 2.54 3.08 2.54 1.77.03 3.25-1.4 3.26-3.17V.02z" />
                                </svg>
                            </a>
                        </div>
                    </section>

                    <div className="mt-10 flex flex-wrap gap-4 text-sm">
                        <Link href="/privacy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-and-conditions" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Terms & Conditions
                        </Link>
                        <Link href="/refund-policy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Refund Policy
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
