import type { Metadata } from "next";
import Link from "next/link";
import { EnvelopeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "Contact Us | Shadii.pk",
    description:
        "Contact Shadii.pk support for account, payment, privacy, safety, and business inquiries.",
};

const contactCards = [
    {
        label: "Email Address",
        value: businessInfo.supportEmail,
        href: `mailto:${businessInfo.supportEmail}`,
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
        <main className="page-shell min-h-screen pt-32 pb-10">
            <Navbar />

            <div className="site-shell max-w-5xl relative z-10">
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
                        We review support, billing, and safety messages as quickly as possible. Payment and subscription issues
                        should include the registered email address, plan name, payment reference, and payment date.
                    </p>
                    <div className="mt-6 grid gap-3 text-sm font-medium text-[var(--muted)] sm:grid-cols-2">
                        <p>Billing support: <a className="text-[var(--berry)] hover:underline" href={`mailto:${businessInfo.billingEmail}`}>{businessInfo.billingEmail}</a></p>
                        <p>Safety reports: <a className="text-[var(--berry)] hover:underline" href={`mailto:${businessInfo.abuseEmail}`}>{businessInfo.abuseEmail}</a></p>
                    </div>
                </section>

                <div className="mt-10 flex flex-wrap gap-4 text-sm">
                    <Link href="/privacy-policy" className="btn-secondary px-5 py-3 text-sm">
                        Privacy Policy
                    </Link>
                    <Link href="/terms-and-conditions" className="btn-secondary px-5 py-3 text-sm">
                        Terms & Conditions
                    </Link>
                    <Link href="/refund-policy" className="btn-secondary px-5 py-3 text-sm">
                        Refund Policy
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
