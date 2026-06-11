import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Terms of Service | Shadii.pk",
    description:
        "Terms of Service for using the Shadii.pk website and mobile application.",
};

const terms = [
    {
        title: "Eligibility",
        items: [
            "You must be legally eligible to marry under the laws applicable to you and at least 18 years old to use Shadii.pk.",
            "You must provide accurate information and keep your account credentials secure.",
        ],
    },
    {
        title: "Acceptable use",
        items: [
            "Do not create fake accounts, impersonate others, or submit false verification material.",
            "Do not harass, threaten, scam, extort, spam, or share explicit or illegal content.",
            "Do not attempt to bypass moderation, payment rules, or safety systems.",
            "Do not upload content that infringes another person's rights or violates applicable law.",
        ],
    },
    {
        title: "Profiles, messaging, and moderation",
        items: [
            "Shadii.pk may review, remove, restrict, suspend, or terminate accounts that violate our safety or content rules.",
            "Verification improves trust but does not guarantee compatibility, intent, or outcome.",
            "We may use automated or manual moderation to protect users and enforce platform integrity.",
        ],
    },
    {
        title: "Subscriptions and paid features",
        items: [
            "Paid features, subscription terms, prices, and durations may change over time.",
            "Access to paid features starts only after successful payment confirmation and may expire automatically at the end of the purchased period.",
            "Refund handling depends on the payment channel used and applicable consumer law.",
        ],
    },
    {
        title: "Liability and warranties",
        items: [
            "Shadii.pk is provided on an as-is and as-available basis.",
            "We do not guarantee uninterrupted access, perfect availability, or that every user interaction will be successful or risk-free.",
            "To the maximum extent permitted by law, Shadii.pk is not liable for indirect, incidental, or consequential damages arising from use of the platform.",
        ],
    },
    {
        title: "Termination",
        items: [
            "You may stop using the service at any time and may delete your account from within the app.",
            "We may suspend or terminate accounts that violate these terms, the privacy policy, or safety rules.",
        ],
    },
    {
        title: "Contact",
        items: [
            "General support: support@shadii.pk",
            "Abuse reports: abuse@shadii.pk",
            "Website: https://shadii.pk",
        ],
    },
];

export default function TermsPage() {
    return (
        <main className="page-shell min-h-screen pt-32 pb-10">
            <Navbar />
            
            <div className="site-shell max-w-4xl relative z-10">
                <div className="mb-10 rounded-3xl border border-[var(--line-strong)] bg-[var(--surface-strong)] p-8 shadow-[0_20px_80px_rgba(139,38,62,0.04)] surface-card surface-card--strong">
                    <div className="eyebrow mb-4">
                        Shadii.pk Legal
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                        Terms of Service
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                        These terms govern your use of the Shadii.pk platform, including the website, mobile application, and related services.
                    </p>
                    <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: 11 May 2026</p>
                </div>

                <div className="space-y-6">
                    {terms.map((section) => (
                        <section key={section.title} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm surface-card">
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
                    <Link href="/privacy" className="btn-secondary px-5 py-3 text-sm">
                        Privacy Policy
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
