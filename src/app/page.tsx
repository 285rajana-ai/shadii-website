import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    CheckCircleIcon,
    LockClosedIcon,
    SparklesIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const heroStats = [
    { value: "50K+", label: "serious members" },
    { value: "99%", label: "verified profiles" },
    { value: "8K+", label: "successful matches" },
    { value: "4.8", label: "average app rating" },
];

const pillars: Array<{ icon: IconType; title: string; text: string; note: string }> = [
    {
        icon: CheckBadgeIcon,
        title: "Real verification, not fake trust badges",
        text: "CNIC and live selfie checks make first conversations feel serious from day one.",
        note: "Identity first",
    },
    {
        icon: LockClosedIcon,
        title: "Privacy that respects families",
        text: "Blur controls, safe messaging, and profile visibility designed for dignity and restraint.",
        note: "Calm by default",
    },
    {
        icon: SparklesIcon,
        title: "Fewer profiles, better introductions",
        text: "Daily suggestions focus on fit, intent, and seriousness instead of endless swiping.",
        note: "Curated matching",
    },
    {
        icon: ChatBubbleLeftRightIcon,
        title: "Cleaner conversations",
        text: "Contact sharing, rushed behavior, and unsafe chat patterns can be filtered before they escalate.",
        note: "Moderated chat",
    },
    {
        icon: AdjustmentsHorizontalIcon,
        title: "Search for what actually matters",
        text: "Age, city, education, sect, family values, and intent stay front and center.",
        note: "Focused filters",
    },
    {
        icon: UserGroupIcon,
        title: "Made for individuals and families",
        text: "The design supports private browsing first, then smooth transition into family involvement.",
        note: "Family ready",
    },
];

const steps = [
    {
        number: "01",
        title: "Build a profile that feels trustworthy",
        text: "Add your essentials once, define what matters to you, and present yourself with clarity instead of noise.",
    },
    {
        number: "02",
        title: "Complete verification",
        text: "Identity checks raise confidence for both sides and reduce awkward uncertainty before the first hello.",
    },
    {
        number: "03",
        title: "Receive refined matches",
        text: "The platform focuses on compatible, serious profiles instead of turning your search into a full-time job.",
    },
    {
        number: "04",
        title: "Move with privacy and intention",
        text: "Start conversations safely, involve family when ready, and move toward real marriage conversations.",
    },
];

const planCards = [
    {
        name: "Starter",
        price: "1,000",
        duration: "1 month",
        description: "For users who want a clean start without overcommitting.",
        featured: false,
        items: [
            "Unlimited messaging",
            "Daily curated suggestions",
            "Profile insights and search filters",
            "Safe chat screening",
        ],
    },
    {
        name: "Serious",
        price: "2,500",
        duration: "3 months",
        description: "Best for active search with visibility and privacy controls unlocked.",
        featured: true,
        items: [
            "Everything in Starter",
            "Reveal eligible blurred photos",
            "See who viewed your profile",
            "Priority placement in search",
            "One free profile boost",
        ],
    },
    {
        name: "Family Plus",
        price: "5,000",
        duration: "6 months",
        description: "For users who want maximum consistency, reach, and support.",
        featured: false,
        items: [
            "Everything in Serious",
            "Top placement for longer",
            "Compatibility summary",
            "Priority support handling",
            "Repeat profile boosting",
        ],
    },
];

const testimonials = [
    {
        name: "Mahnoor & Ahmed",
        city: "Lahore",
        quote:
            "The app felt serious immediately. Verification gave both families confidence before the first proper conversation.",
    },
    {
        name: "Amna & Bilal",
        city: "Karachi",
        quote:
            "We were not buried under random profiles. The suggestions felt mature, relevant, and respectful of what we wanted.",
    },
    {
        name: "Zara & Usman",
        city: "Islamabad",
        quote:
            "Privacy controls made the experience comfortable. Nothing felt loud, exposed, or rushed.",
    },
];

const faqs = [
    {
        question: "Is the app free to start with?",
        answer:
            "Yes. Joining and creating your profile is free, and the first message flow is designed to let serious users begin without pressure.",
    },
    {
        question: "How does verification work?",
        answer:
            "Users complete CNIC and live selfie checks. Verified profiles are easier to trust and easier for families to take seriously.",
    },
    {
        question: "Can women keep photos private?",
        answer:
            "Yes. Photo privacy controls are built into the experience so visibility can stay restricted until interest becomes serious.",
    },
    {
        question: "What makes this different from typical matrimony apps?",
        answer:
            "The product is designed around fewer, better introductions, privacy-first behavior, and a calmer interface that avoids swipe-app chaos.",
    },
    {
        question: "Which payments are supported?",
        answer:
            "EasyPaisa, JazzCash, debit card, credit card, and bank transfer can all be supported for plan purchases.",
    },
    {
        question: "Can families be involved later?",
        answer:
            "Yes. The experience is intentionally built so private discovery can gradually turn into family-backed conversation at the right moment.",
    },
];

function SectionLead({
    eyebrow,
    title,
    accent,
    copy,
}: {
    eyebrow: string;
    title: string;
    accent?: string;
    copy: string;
}) {
    return (
        <div className="section-heading reveal-on-scroll">
            <div className="eyebrow">{eyebrow}</div>
            <h2 className="section-title">
                {title}
                {accent ? (
                    <>
                        {" "}
                        <span className="display-accent">{accent}</span>
                    </>
                ) : null}
            </h2>
            <p className="section-copy">{copy}</p>
        </div>
    );
}

function StoreBadge({ label, store }: { label: string; store: string }) {
    return (
        <a href="#" className="store-badge transition-transform hover:-translate-y-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-lg text-white">
                {store === "App Store" ? "A" : "P"}
            </div>
            <span>
                <small>{label}</small>
                <strong>{store}</strong>
            </span>
        </a>
    );
}

export default function Home() {
    return (
        <main className="page-shell overflow-x-hidden">
            <Navbar />

            <section className="section pb-10 pt-36 sm:pt-40 lg:pt-44">
                <div className="site-shell">
                    <div className="grid items-center gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:gap-14">
                        <div>
                            <div className="eyebrow hero-badge">Pakistan&apos;s serious matrimonial platform</div>
                            <h1 className="hero-title mt-6 max-w-4xl font-display text-[clamp(3.3rem,9vw,6.2rem)] font-bold leading-[0.94] tracking-[-0.055em] text-white">
                                Find your <span className="display-accent">life partner</span> with dignity,
                                privacy, and real intent.
                            </h1>
                            <p className="hero-copy mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                                A full rebuild for the Shadii.pk homepage means a calmer experience from the first
                                screen: better spacing, clearer hierarchy, stronger trust signals, and a design that
                                feels premium without feeling noisy.
                            </p>

                            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a href="#download" className="btn-primary w-full sm:w-auto">
                                    Download App
                                    <ArrowRightIcon className="h-5 w-5" />
                                </a>
                                <a href="#about" className="btn-secondary w-full sm:w-auto">
                                    Explore Features
                                </a>
                            </div>

                            <div className="hero-trust mt-8 flex flex-wrap gap-3 text-sm text-white/58">
                                {[
                                    "CNIC + selfie verification",
                                    "Private photos & safe chat",
                                    "Built for families as well",
                                ].map((item) => (
                                    <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                                        <CheckCircleIcon className="h-4 w-4 text-[#e0b562]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hero-showcase glow-accent surface-card surface-card--strong overflow-hidden p-5 sm:p-6">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)]">
                                <div className="floating-panel rounded-[1.5rem] border border-white/10 bg-[#1b1216] p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f2dcc0]/70">
                                                Today&apos;s compatibility board
                                            </div>
                                            <div className="mt-3 font-display text-4xl font-bold text-white">92%</div>
                                        </div>
                                        <div className="rounded-full border border-[#e0b562]/30 bg-[#e0b562]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#e0b562]">
                                            High fit
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {[
                                            ["Education", "Aligned"],
                                            ["Family intent", "Strong"],
                                            ["City preference", "Matched"],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                                                <span className="text-white/58">{label}</span>
                                                <span className="font-semibold text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-5 rounded-[1.3rem] bg-[linear-gradient(135deg,rgba(224,181,98,0.18),rgba(122,38,58,0.15))] px-4 py-3 text-sm leading-7 text-white/70">
                                        Daily suggestions are presented with clarity, trust, and enough context for a
                                        serious decision.
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="floating-panel floating-panel-delay rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#7a263a,#e0b562)] text-sm font-bold text-white">
                                                M
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                                    Mahnoor, 25
                                                    <CheckBadgeIcon className="h-4 w-4 text-[#e0b562]" />
                                                </div>
                                                <div className="text-xs text-white/52">Lahore · Doctor · Family involved</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 rounded-2xl border border-[#e0b562]/20 bg-[#e0b562]/8 px-3 py-2 text-xs text-[#f2dcc0]">
                                            Photos private. Profile verified. First conversation protected.
                                        </div>
                                    </div>

                                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e0b562]">
                                            Safe messaging
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#e0b562] px-3 py-2 text-xs font-semibold text-[#2a1712]">
                                                Assalam o Alaikum
                                            </div>
                                            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.07] px-3 py-2 text-xs text-white/80">
                                                Walaikum Assalam, glad to connect.
                                            </div>
                                            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.07] px-3 py-2 text-xs text-white/80">
                                                Let&apos;s proceed respectfully and involve family when ready.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.5rem] border border-white/10 bg-[#1a1215] p-4">
                                        <div className="text-sm font-semibold text-white">A calmer first impression</div>
                                        <div className="mt-2 text-sm leading-7 text-white/56">
                                            Premium feel, better spacing, stronger content hierarchy, and no broken card stacking.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-metrics mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {heroStats.map((item) => (
                            <div key={item.label} className="metric-tile">
                                <div className="font-display text-4xl font-bold tracking-[-0.04em] text-white">
                                    {item.value}
                                </div>
                                <div className="mt-2 text-sm text-white/56">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="section section-rule">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Why this version is better"
                        title="A homepage rebuilt for"
                        accent="clarity"
                        copy="Every section now follows a cleaner layout rhythm, with stronger hierarchy, balanced grids, and components that stay in place instead of fighting each other."
                    />

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {pillars.map((item) => {
                            const Icon = item.icon;
                            return (
                                <article key={item.title} className="surface-card reveal-on-scroll p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(122,38,58,0.9),rgba(224,181,98,0.24))] text-[#f2dcc0]">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="rounded-full border border-[#e0b562]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e0b562]">
                                            {item.note}
                                        </div>
                                    </div>
                                    <h3 className="mt-6 font-display text-[1.7rem] font-bold leading-tight text-white">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-white/58">{item.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="journey" className="section section-rule">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Simple journey"
                        title="From profile setup to"
                        accent="real conversation"
                        copy="The rebuild keeps the flow straightforward. Instead of a crowded landing page, each section now earns its place and leads naturally into the next one."
                    />

                    <div className="grid gap-5 lg:grid-cols-2">
                        {steps.map((step) => (
                            <article key={step.number} className="surface-card reveal-on-scroll p-6 sm:p-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e0b562]/28 bg-[#e0b562]/10 font-display text-xl font-bold text-[#e0b562]">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-[1.85rem] font-bold leading-tight text-white">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-white/58">{step.text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="plans" className="section section-rule">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Straight pricing"
                        title="Clean plans for a"
                        accent="serious search"
                        copy="No clutter, no awkward pricing mess. The plan section now reads clearly and keeps the premium option visibly highlighted without breaking the layout."
                    />

                    <div className="grid gap-5 xl:grid-cols-3">
                        {planCards.map((plan) => (
                            <article
                                key={plan.name}
                                className={[
                                    "surface-card reveal-on-scroll flex h-full flex-col p-6 sm:p-8",
                                    plan.featured ? "surface-card--strong" : "",
                                ].join(" ")}
                            >
                                {plan.featured ? (
                                    <div className="mb-5 w-fit rounded-full bg-[#e0b562] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#2a1712]">
                                        Most popular
                                    </div>
                                ) : null}

                                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#e0b562]">
                                    {plan.name}
                                </div>
                                <div className="mt-4 flex items-end gap-2">
                                    <span className="mb-2 text-sm font-semibold text-white/46">PKR</span>
                                    <span className="font-display text-[3.4rem] font-bold tracking-[-0.05em] text-white">
                                        {plan.price}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-white/54">for {plan.duration}</div>
                                <p className="mt-5 text-sm leading-7 text-white/58">{plan.description}</p>

                                <div className="my-6 h-px bg-white/8" />

                                <div className="flex-1 space-y-3">
                                    {plan.items.map((item) => (
                                        <div key={item} className="flex items-start gap-3 text-sm text-white/72">
                                            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#e0b562]" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <a href="#download" className={plan.featured ? "btn-primary mt-8" : "btn-secondary mt-8"}>
                                    Choose {plan.name}
                                </a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="stories" className="section section-rule">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Real outcomes"
                        title="Designed for introductions that can"
                        accent="go somewhere"
                        copy="A decent matrimonial homepage should not just look pretty. It should build enough trust that users can imagine a respectful next step."
                    />

                    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                        <article className="surface-card surface-card--strong reveal-on-scroll p-7 sm:p-10">
                            <div className="mb-5 flex gap-1 text-[#e0b562]">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <StarIcon key={index} className="h-5 w-5" />
                                ))}
                            </div>
                            <p className="font-display text-[1.9rem] leading-[1.45] text-white sm:text-[2.2rem]">
                                “The redesigned experience feels calm, private, and serious. That changes how people trust the platform.”
                            </p>
                            <div className="mt-8 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0b562] text-sm font-bold text-[#2a1712]">
                                    SP
                                </div>
                                <div>
                                    <div className="font-semibold text-white">Shadii.pk promise</div>
                                    <div className="text-sm text-white/52">Privacy, intent, and clean presentation</div>
                                </div>
                            </div>
                        </article>

                        {testimonials.map((story) => (
                            <article key={story.name} className="surface-card reveal-on-scroll p-6">
                                <div className="mb-4 flex gap-1 text-[#e0b562]">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <StarIcon key={index} className="h-4 w-4" />
                                    ))}
                                </div>
                                <p className="text-sm leading-7 text-white/66">“{story.quote}”</p>
                                <div className="mt-6 border-t border-white/8 pt-4">
                                    <div className="font-semibold text-white">{story.name}</div>
                                    <div className="text-xs text-white/48">{story.city}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="section section-rule">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Questions"
                        title="Everything important, without the"
                        accent="clutter"
                        copy="The new FAQ keeps answers readable and properly spaced so the bottom of the page feels as polished as the top."
                    />

                    <div className="surface-card reveal-on-scroll mx-auto max-w-4xl p-5 sm:p-8">
                        {faqs.map((faq, index) => (
                            <details key={faq.question} className="faq-item" open={index === 0}>
                                <summary>
                                    <span>{faq.question}</span>
                                    <span>+</span>
                                </summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section id="download" className="section section-rule pb-14">
                <div className="site-shell">
                    <div className="surface-card surface-card--strong reveal-on-scroll overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
                        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <div className="eyebrow">Ready to begin</div>
                                <h2 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.3rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white">
                                    Start your journey <span className="display-accent">today</span>
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-white/66">
                                    This rebuild gives the website a proper premium structure. If you want, the same
                                    visual language can now be carried into the admin panel and mobile app screens.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                                <StoreBadge label="Download on the" store="App Store" />
                                <StoreBadge label="Get it on" store="Google Play" />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/56">
                            {["Free profile setup", "Secure plans", "Private-first experience"].map((item) => (
                                <div key={item} className="rounded-full border border-white/10 px-4 py-2">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
