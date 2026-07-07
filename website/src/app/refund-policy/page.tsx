import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "Refund Policy | Shadii.pk",
    description:
        "Refund policy for Shadii.pk subscriptions, boosts, paid introductions, and payment disputes.",
};

const sections = [
    {
        title: "Overview",
        items: [
            "This Refund Policy applies to purchases made for Shadii.pk subscriptions, boosts, contact unlocks, and other paid features.",
            "Paid features are activated after payment confirmation through the selected payment channel.",
            "Refund eligibility depends on payment status, feature usage, duplicate charges, and applicable consumer protection rules.",
        ],
    },
    {
        title: "Eligible refund cases",
        items: [
            "Duplicate payment for the same plan or feature.",
            "Payment was charged but the paid feature was not activated after verification.",
            "A technical issue caused an incorrect charge that can be verified from our records.",
            "A transaction was reported promptly and the service was not used after purchase.",
        ],
    },
    {
        title: "Non-refundable cases",
        items: [
            "Completed subscriptions, boosts, or contact unlocks that have already been used.",
            "Refund requests based only on match outcome, user preference, or unsuccessful conversations.",
            "Payments made through false, incomplete, or unverifiable transaction details.",
            "Accounts suspended or terminated because of policy violations, abuse, fraud, or misuse.",
        ],
    },
    {
        title: "How to request a refund",
        items: [
            `Email ${businessInfo.billingEmail} from your registered email address.`,
            "Include your full name, registered phone number, plan or feature purchased, payment date, amount, transaction reference, and a screenshot or receipt if available.",
            "Our team may request additional verification before approving or rejecting the refund.",
        ],
    },
    {
        title: "Processing time",
        items: [
            "Refund reviews usually take 5 to 10 business days after complete information is received.",
            "Approved refunds are returned through the original payment channel where possible.",
            "Bank, wallet, or payment gateway processing times may vary after Shadii.pk approves the refund.",
        ],
    },
    {
        title: "Contact",
        items: [
            `Billing support: ${businessInfo.billingEmail}`,
            `General support: ${businessInfo.supportEmail}`,
            `Website: ${businessInfo.website}`,
        ],
    },
];

export default function RefundPolicyPage() {
    return (
        <main className="min-h-screen flex flex-col justify-between">
            <Navbar />
            
            <div className="flex-1 flex flex-col justify-center my-12">
                <div className="site-shell max-w-4xl relative z-10 pt-28 pb-10">
                    <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                        <div className="eyebrow mb-4">Shadii.pk Legal</div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                            Refund Policy
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                            This policy explains when Shadii.pk payments may be refunded and how users can request billing review.
                        </p>
                        <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: {businessInfo.lastUpdated}</p>
                    </div>

                    <div className="space-y-6">
                        {sections.map((section) => (
                            <section key={section.title} className="luxury-card mb-6">
                                <h2 className="text-xl font-bold text-[var(--berry)] mb-4">{section.title}</h2>
                                <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-[var(--muted)] sm:text-base font-medium">
                                    {section.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-wrap gap-4 text-sm">
                        <Link href="/contact-us" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Contact Us
                        </Link>
                        <Link href="/terms-and-conditions" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Terms & Conditions
                        </Link>
                        <Link href="/privacy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
