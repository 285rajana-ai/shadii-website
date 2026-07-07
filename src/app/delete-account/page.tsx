import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Account Deletion | Shadii.pk",
    description:
        "Instructions for deleting your Shadii.pk account and requesting removal of associated data.",
};

const steps = [
    "Open the Shadii.pk app and sign in to the account you want to delete.",
    "Go to Settings.",
    "Open the Danger Zone section.",
    "Tap Delete Account.",
    "Confirm the deletion request.",
    "Your session will be ended and your account will be scheduled for permanent deletion.",
];

const retention = [
    "Core profile and login access are removed when the deletion request is processed.",
    "Some limited records may be retained for fraud prevention, payment reconciliation, abuse investigations, dispute handling, or legal compliance.",
    "If you need manual assistance, email support@shadii.pk from your registered email address.",
];

export default function DeleteAccountPage() {
    return (
        <main className="min-h-screen flex flex-col justify-between">
            <Navbar />
            
            <div className="flex-1 flex flex-col justify-center my-12">
                <div className="site-shell max-w-4xl relative z-10 pt-28 pb-10">
                    <div className="mb-10 luxury-card surface-card--strong corner-ornament-card">
                        <div className="eyebrow mb-4">
                            Shadii.pk Support
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
                            Account Deletion
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                            You can delete your Shadii.pk account directly from the mobile app. This page exists for app store compliance and user support reference.
                        </p>
                        <p className="mt-4 text-xs text-[var(--muted)]/60">Last updated: 11 May 2026</p>
                    </div>

                    <section className="luxury-card mb-6">
                        <h2 className="text-xl font-bold text-[var(--berry)] mb-4 font-display">Delete your account in the app</h2>
                        <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-[var(--muted)] sm:text-base font-medium">
                            {steps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </section>

                    <section className="luxury-card mb-6">
                        <h2 className="text-xl font-bold text-[var(--berry)] mb-4 font-display">What may be retained</h2>
                        <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-[var(--muted)] sm:text-base font-medium">
                            {retention.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="luxury-card mb-6">
                        <h2 className="text-xl font-bold text-[var(--berry)] mb-4 font-display">Need help?</h2>
                        <p className="text-sm leading-7 text-[var(--muted)] sm:text-base font-medium">
                            Contact support at <a className="text-[var(--berry)] hover:underline" href="mailto:support@shadii.pk">support@shadii.pk</a> or report abuse at <a className="text-[var(--berry)] hover:underline" href="mailto:abuse@shadii.pk">abuse@shadii.pk</a>.
                        </p>
                    </section>

                    <div className="mt-10 flex flex-wrap gap-4 text-sm">
                        <Link href="/privacy" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="btn-editorial-secondary px-5 py-3 text-sm rounded-2xl">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
