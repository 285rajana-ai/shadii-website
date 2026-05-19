import type { Metadata } from "next";
import Link from "next/link";

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
        <main className="min-h-screen bg-[#0A0A0B] px-6 py-14 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl">
                <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
                    <div className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
                        Shadii.pk Legal
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                        This policy explains how Shadii.pk collects, uses, stores, and protects user information in the app and on the website.
                        By using Shadii.pk, you agree to this policy.
                    </p>
                    <p className="mt-4 text-sm text-white/50">Last updated: 11 May 2026</p>
                </div>

                <div className="space-y-6">
                    {sections.map((section) => (
                        <section key={section.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-white/72 sm:text-base">
                                {section.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-4 text-sm text-white/72">
                    <Link href="/terms" className="rounded-full border border-white/12 px-5 py-3 transition hover:border-[#D4AF37]/50 hover:text-white">
                        Terms of Service
                    </Link>
                    <Link href="/delete-account" className="rounded-full border border-white/12 px-5 py-3 transition hover:border-[#D4AF37]/50 hover:text-white">
                        Account Deletion
                    </Link>
                </div>
            </div>
        </main>
    );
}
