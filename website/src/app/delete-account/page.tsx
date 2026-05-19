import type { Metadata } from "next";
import Link from "next/link";

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
        <main className="min-h-screen bg-[#0A0A0B] px-6 py-14 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl">
                <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
                    <div className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
                        Shadii.pk Support
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Account Deletion
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                        You can delete your Shadii.pk account directly from the mobile app. This page exists for app store compliance and user support reference.
                    </p>
                    <p className="mt-4 text-sm text-white/50">Last updated: 11 May 2026</p>
                </div>

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                    <h2 className="text-2xl font-semibold text-white">Delete your account in the app</h2>
                    <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-white/72 sm:text-base">
                        {steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ol>
                </section>

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                    <h2 className="text-2xl font-semibold text-white">What may be retained</h2>
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-white/72 sm:text-base">
                        {retention.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                    <h2 className="text-2xl font-semibold text-white">Need help?</h2>
                    <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                        Contact support at <a className="text-[#D4AF37]" href="mailto:support@shadii.pk">support@shadii.pk</a> or report abuse at <a className="text-[#D4AF37]" href="mailto:abuse@shadii.pk">abuse@shadii.pk</a>.
                    </p>
                </section>

                <div className="mt-10 flex flex-wrap gap-4 text-sm text-white/72">
                    <Link href="/privacy" className="rounded-full border border-white/12 px-5 py-3 transition hover:border-[#D4AF37]/50 hover:text-white">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="rounded-full border border-white/12 px-5 py-3 transition hover:border-[#D4AF37]/50 hover:text-white">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </main>
    );
}
