import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy | Shadii.pk",
    description:
        "Privacy Policy for Shadii.pk covering account data, verification uploads, messages, payments, and account deletion.",
};

const sections = [
    {
        title: "Information we collect",
        items: [
            "Account details such as name, email address, phone number, age, gender, city, and profile preferences.",
            "Profile content such as photos, bio, education, interests, and verification status.",
            "Verification data including CNIC images and live selfie submissions when you choose to verify your profile.",
            "Usage data such as login activity, app interactions, device information, IP address, and crash diagnostics.",
            "Payment-related records such as selected plan, transaction reference, and billing status. We do not store full card numbers on our servers.",
        ],
    },
    {
        title: "How we use your information",
        items: [
            "To create and maintain your account and profile.",
            "To provide matching, messaging, moderation, safety, and support features.",
            "To verify identity, reduce fake profiles, and investigate abuse or fraud.",
            "To process subscriptions, boosts, and related billing records.",
            "To comply with legal obligations and enforce our Terms of Service.",
        ],
    },
    {
        title: "How we share information",
        items: [
            "Profile information that you choose to publish is shown to eligible users inside the app.",
            "Verification data is restricted to internal review and is not displayed publicly.",
            "We may share limited data with service providers that help us host infrastructure, send email, process payments, or detect fraud.",
            "We may disclose information when required by law, court order, or to protect the safety of our users and platform.",
        ],
    },
    {
        title: "Data retention",
        items: [
            "We keep account data while your account remains active and for a limited period afterwards as required for fraud prevention, dispute handling, tax, and legal compliance.",
            "Verification submissions may be retained for safety review, moderation history, and legal obligations.",
            "You can request deletion of your account from inside the app or by contacting support.",
        ],
    },
    {
        title: "Your rights and choices",
        items: [
            "You can update most profile information from the app.",
            "You can delete your account from the Settings screen.",
            "You can request help regarding your data by emailing support@shadii.pk.",
            "You can control selected privacy settings such as online status visibility inside the app.",
        ],
    },
    {
        title: "Contact",
        items: [
            "Privacy and support requests: support@shadii.pk",
            "Abuse reports: abuse@shadii.pk",
            "Website: https://shadii.pk",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <main className="page-shell min-h-screen pt-32 pb-10">
            <Navbar />
            
            <div className="site-shell max-w-4xl relative z-10">
                <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                    <div className="eyebrow mb-4">
                        Shadii.pk Legal
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                        This policy explains how Shadii.pk collects, uses, stores, and protects user information in the app and on the website.
                        By using Shadii.pk, you agree to this policy.
                    </p>
                    <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: 11 May 2026</p>
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
                    <Link href="/terms" className="btn-secondary px-5 py-3 text-sm">
                        Terms of Service
                    </Link>
                    <Link href="/delete-account" className="btn-secondary px-5 py-3 text-sm">
                        Account Deletion
                    </Link>
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
