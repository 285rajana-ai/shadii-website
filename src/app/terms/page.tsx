import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "Terms & Conditions | Shadii.pk",
    description:
        "Terms and Conditions for using the Shadii.pk website and mobile application.",
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
            `General support: ${businessInfo.supportEmail}`,
            `Billing support: ${businessInfo.billingEmail}`,
            `Contact number: ${businessInfo.contactNumber}`,
            `Business address: ${businessInfo.businessAddress}`,
            `Abuse reports: ${businessInfo.abuseEmail}`,
            `Website: ${businessInfo.website}`,
        ],
    },
];

export default function TermsPage() {
    return (
        <main className="min-h-screen flex flex-col justify-between">
            <Navbar />
            
            <div className="flex-1 flex flex-col justify-center my-12">
                <div className="site-shell max-w-4xl relative z-10 pt-28 pb-10">
                    <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                        <div className="eyebrow mb-4">
                            Shadii.pk Legal
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                            Terms & Conditions
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                            These terms govern your use of the Shadii.pk platform, including the website, mobile application, and related services.
                        </p>
                        <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: {businessInfo.lastUpdated}</p>
                    </div>

                    <div className="space-y-6">
                        {terms.map((section) => (
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
                        <Link href="/privacy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Privacy Policy
                        </Link>
                        <Link href="/refund-policy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Refund Policy
                        </Link>
                        <Link href="/contact-us" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Contact Us
                        </Link>
                        <Link href="/delete-account" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Account Deletion
                        </Link>
                    </div>
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
