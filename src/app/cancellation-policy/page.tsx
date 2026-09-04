import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "Cancellation Policy",
    description:
        "Cancellation policy for Shadii.pk premium matchmaking memberships, auto-renewals, and digital service subscriptions.",
    keywords: [
        "shadii.pk cancellation policy",
        "cancel matrimonial subscription",
        "rishta package cancellation",
        "membership cancellation terms"
    ],
};

const sections = [
    {
        title: "1. Policy Overview",
        items: [
            "This Cancellation Policy governs the terms and procedures for cancelling paid membership packages, automated renewals, profile boosts, and contact unlocks on Shadii.pk.",
            "Our objective is to ensure transparent, fair, and reliable billing practices for all members seeking serious matrimonial proposals.",
            "By purchasing any paid plan on Shadii.pk, you acknowledge and agree to the cancellation guidelines set forth below."
        ],
    },
    {
        title: "2. How to Cancel Your Subscription",
        items: [
            "Members can cancel their subscription or disable recurring billing at any time without any cancellation fees.",
            "Self-Service via Mobile App: Navigate to Settings > Account & Subscription > Manage Membership > Cancel Subscription.",
            `Email Support: Alternatively, send a written cancellation request to our billing desk at ${businessInfo.billingEmail} from your registered email address.`,
            "Please mention your registered phone number, full name, and active plan name in your email to ensure expedited processing."
        ],
    },
    {
        title: "3. Cancellation Timeline & Effective Date",
        items: [
            "Upon receiving a cancellation request, future automatic billings are stopped immediately.",
            "Your existing premium benefits (such as verified profile badge, active proposal requests, and unlocked features) will remain accessible until the end of your currently paid subscription period.",
            "No further charges will be billed to your card, mobile wallet (EasyPaisa/JazzCash), or bank account following successful cancellation."
        ],
    },
    {
        title: "4. Cancellation Within 24-48 Hours (Grace Period)",
        items: [
            "If you purchased a package by mistake or experienced an accidental duplicate transaction, you may request an immediate cancellation and billing review within 24 to 48 hours of purchase.",
            "If none of the paid features (such as direct contact unlocks or priority matchmaking assistance) have been consumed, you may be eligible for a full or partial refund in accordance with our Refund Policy.",
            "Custom or third-party payment gateway transaction processing fees charged by the banking switch may be non-refundable where applicable by law."
        ],
    },
    {
        title: "5. Account Deletion vs. Plan Cancellation",
        items: [
            "Cancelling a plan stops future billing renewals while keeping your matrimonial profile intact so you can continue searching at standard tier.",
            "If you wish to permanently delete your personal information, photos, and match history, you can submit an account deletion request via the app or at shadii.pk/delete-account.",
            "Deleting your account will immediately terminate all active sessions and forfeit any remaining subscription days."
        ],
    },
    {
        title: "6. Merchant & Business Information",
        items: [
            `Brand Name: ${businessInfo.brandName}`,
            `Legal Entity & Business Affiliation: ${businessInfo.legalName} (A project of ${businessInfo.businessAffiliation})`,
            `Registered Office Address: ${businessInfo.businessAddress}`,
            `Direct Phone / Helpline: ${businessInfo.contactNumber}`,
            `Billing & Merchant Queries: ${businessInfo.billingEmail}`,
            `Customer Support Desk: ${businessInfo.supportEmail}`,
            `Official Website: ${businessInfo.website}`,
        ],
    },
];

export default function CancellationPolicyPage() {
    return (
        <main className="min-h-screen flex flex-col justify-between">
            <Navbar />
            
            <div className="flex-1 flex flex-col justify-center my-12">
                <div className="site-shell max-w-4xl relative z-10 pt-28 pb-10">
                    <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                        <div className="eyebrow mb-4">Shadii.pk Legal & Compliance</div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                            Cancellation Policy
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                            Learn how you can easily cancel your Shadii.pk membership, stop automatic renewals, and manage your billing settings.
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
                        <Link href="/refund-policy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Refund Policy
                        </Link>
                        <Link href="/terms-and-conditions" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Terms & Conditions
                        </Link>
                        <Link href="/contact-us" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Contact Us
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
