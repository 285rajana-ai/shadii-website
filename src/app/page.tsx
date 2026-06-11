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

function FiligreeDivider() {
    return (
        <div className="w-full flex items-center justify-center gap-4 py-10 text-[var(--gold)] opacity-35 select-none pointer-events-none site-shell">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--gold)]" />
            <svg className="w-16 h-6 shrink-0" viewBox="0 0 100 24" fill="currentColor">
                <path d="M50,12 C40,4 35,4 30,12 C25,20 20,20 10,12 C5,8 2,12 0,12 C0,12 5,16 10,12 C20,4 25,4 30,12 C35,20 40,20 50,12 Z" />
                <circle cx="50" cy="12" r="3" />
                <path d="M50,12 C60,4 65,4 70,12 C75,20 80,20 90,12 C95,8 98,12 100,12 C100,12 95,16 90,12 C80,4 75,4 70,12 C65,20 60,20 50,12 Z" />
            </svg>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--gold)]" />
        </div>
    );
}

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
            <p className="section-copy text-[var(--muted)]">{copy}</p>
        </div>
    );
}

function StoreBadge({ label, store }: { label: string; store: string }) {
    const isApple = store === "App Store";
    return (
        <a href="#" className="store-badge transition-transform hover:-translate-y-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--berry)] text-white shadow-sm shrink-0">
                {isApple ? (
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                    </svg>
                ) : (
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M5.25 3.004c-.266 0-.525.064-.757.19L14.7 12.28 5.6 21.056c.205.105.434.157.666.157.26 0 .513-.065.736-.196L19.267 13.9c.776-.448.776-1.75 0-2.198L7.002 4.57c-.502-.294-1.118-.4-1.752-.396zM3.5 4.77v14.46c0 .52.293.985.72 1.228l8.28-8.228-8.28-8.227c-.427.243-.72.708-.72 1.227z"/>
                    </svg>
                )}
            </div>
            <span>
                <small className="text-[var(--muted)]">{label}</small>
                <strong className="text-[var(--text)]">{store}</strong>
            </span>
        </a>
    );
}

export default function Home() {
    return (
        <main className="page-shell overflow-x-hidden">
            <Navbar />

            {/* Video Background Layer */}
            <div className="absolute top-0 left-0 right-0 h-[120vh] z-0 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-[0.12] mix-blend-multiply"
                    style={{ filter: "sepia(30%) saturate(140%)" }}
                >
                    <source src="https://videos.pexels.com/video-files/7525287/7525287-uhd_2560_1440_24fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--canvas)]/50 to-[var(--canvas-deep)]" />
            </div>

            <section className="section pb-10 pt-36 sm:pt-40 lg:pt-44 relative z-10">
                <div className="site-shell">
                    <div className="grid items-center gap-12 xl:grid-cols-[1.1fr_0.9fr] xl:gap-16">
                        <div>
                            <div className="eyebrow hero-badge shadow-sm">Pakistan&apos;s Premium Matrimonial Platform</div>
                            <h1 className="hero-title mt-6 max-w-4xl font-display text-[clamp(3.3rem,9vw,5.5rem)] font-bold leading-[1.0] tracking-[-0.04em] text-[var(--text)]">
                                Find your <span className="display-accent">life partner</span> with dignity & discretion.
                            </h1>
                            <p className="hero-copy mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg font-medium">
                                Shadii.pk is built for serious individuals and families seeking meaningful matrimonial introductions. Experience a calmer matchmaking process with verified profiles, complete photo privacy, and zero social swiping clutter.
                            </p>

                            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a href="#download" className="btn-primary w-full sm:w-auto px-7">
                                    Download App
                                    <ArrowRightIcon className="h-5 w-5" />
                                </a>
                                <a href="#about" className="btn-secondary w-full sm:w-auto px-7">
                                    Explore Features
                                </a>
                            </div>

                            <div className="hero-trust mt-8 flex flex-wrap gap-3 text-sm text-[var(--muted)] font-medium">
                                {[
                                    "CNIC + Selfie Verification",
                                    "Private Photos & Safe Chat",
                                    "Family-Backed Introductions",
                                ].map((item) => (
                                    <div key={item} className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/70 px-4 py-2.5 shadow-sm">
                                        <CheckCircleIcon className="h-4 w-4 text-[var(--berry)]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hero-showcase glow-accent flex items-center justify-center py-6 select-none pointer-events-none">
                            <div className="phone-frame">
                                <div className="phone-notch" />
                                <div className="phone-content text-left">
                                    {/* App Mockup Header */}
                                    <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-display font-bold text-xs text-[var(--berry)]">Shadii.pk</span>
                                            <span className="rounded-full bg-[var(--gold)]/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--gold)] border border-[var(--gold)]/20">VIP</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-bold">Safe Mode</span>
                                        </div>
                                    </div>

                                    {/* Scrollable mockup content */}
                                    <div className="space-y-4">
                                        {/* Mockup Profile */}
                                        <div className="rounded-2xl border border-[var(--line-strong)] bg-white p-4 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-bl from-[var(--gold)]/10 to-transparent pointer-events-none" />
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7a1c31,#c09950)] text-sm font-bold text-white shadow-sm">
                                                    M
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]">
                                                        Mahnoor, 25
                                                        <CheckBadgeIcon className="h-4 w-4 text-[var(--berry)]" />
                                                    </div>
                                                    <div className="text-[10px] text-[var(--muted)] font-medium">Lahore · MBBS Doctor</div>
                                                </div>
                                            </div>
                                            <div className="mt-3.5 rounded-xl bg-[var(--canvas-deep)] border border-[var(--line-strong)] px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)] font-medium">
                                                🔒 Photo blurred for privacy. Verified CNIC. Family contact sharing enabled.
                                            </div>
                                        </div>

                                        {/* Mockup Match Meter */}
                                        <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--berry)]">Match Compatibility</span>
                                                <span className="rounded-full bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 text-[9px] font-bold text-emerald-800">92% Match</span>
                                            </div>
                                            <div className="mt-3.5 space-y-2 text-[10px]">
                                                <div className="flex justify-between text-[var(--muted)] font-medium">
                                                    <span>Sect & Values</span>
                                                    <span className="font-bold text-[var(--text)]">Matched</span>
                                                </div>
                                                <div className="flex justify-between text-[var(--muted)] font-medium">
                                                    <span>Education Level</span>
                                                    <span className="font-bold text-[var(--text)]">Aligned</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mockup Chat Screen */}
                                        <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-4 shadow-sm">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--berry)]">Dignified Chat</span>
                                            <div className="mt-3 space-y-2">
                                                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-none bg-[var(--berry)] p-2.5 text-[10px] font-medium text-white shadow-xs">
                                                    Assalam o Alaikum, interest request sent.
                                                </div>
                                                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[var(--canvas-deep)] border border-[var(--line)] p-2.5 text-[10px] text-[var(--text)] leading-relaxed font-medium shadow-xs">
                                                    Walaikum Assalam, accepted. Let&apos;s involve family.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-metrics mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative z-10">
                        {heroStats.map((item) => (
                            <div key={item.label} className="metric-tile">
                                <div className="font-display text-4xl font-bold tracking-[-0.04em] text-[var(--berry)]">
                                    {item.value}
                                </div>
                                <div className="mt-2 text-sm text-[var(--muted)] font-medium">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="section relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Why this version is better"
                        title="A homepage rebuilt for"
                        accent="clarity"
                        copy="Every section now follows a cleaner layout rhythm, with stronger hierarchy, balanced grids, and components that stay in place instead of fighting each other."
                    />

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {pillars.map((item) => {
                            const Icon = item.icon;
                            return (
                                <article key={item.title} className="luxury-card corner-ornament-card reveal-on-scroll">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(194,155,87,0.15),rgba(139,38,62,0.08))] text-[var(--berry)] border border-[var(--line-strong)]">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="rounded-full border border-[var(--line-strong)] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--berry)]">
                                            {item.note}
                                        </div>
                                    </div>
                                    <h3 className="mt-6 font-display text-[1.7rem] font-bold leading-tight text-[var(--text)]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[var(--muted)] font-medium">{item.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="journey" className="section relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Simple journey"
                        title="From profile setup to"
                        accent="real conversation"
                        copy="The rebuild keeps the flow straightforward. Instead of a crowded landing page, each section now earns its place and leads naturally into the next one."
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        {steps.map((step) => (
                            <article key={step.number} className="luxury-card reveal-on-scroll">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white/60 font-display text-xl font-bold text-[var(--berry)] shadow-sm">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-[1.85rem] font-bold leading-tight text-[var(--text)]">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-[var(--muted)] font-medium">{step.text}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="plans" className="section relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Straight pricing"
                        title="Clean plans for a"
                        accent="serious search"
                        copy="No clutter, no awkward pricing mess. The plan section now reads clearly and keeps the premium option visibly highlighted without breaking the layout."
                    />

                    <div className="grid gap-6 xl:grid-cols-3">
                        {planCards.map((plan) => (
                            <article
                                key={plan.name}
                                className={[
                                    "luxury-card reveal-on-scroll flex h-full flex-col",
                                    plan.featured ? "surface-card--strong" : "",
                                ].join(" ")}
                            >
                                {plan.featured ? (
                                    <div className="mb-5 w-fit rounded-full bg-[var(--berry)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white shadow-md">
                                        Most popular
                                    </div>
                                ) : null}

                                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--berry)]">
                                    {plan.name}
                                </div>
                                <div className="mt-4 flex items-end gap-2 text-[var(--text)]">
                                    <span className="mb-2 text-sm font-semibold text-[var(--muted)]">PKR</span>
                                    <span className="font-display text-[3.4rem] font-bold tracking-[-0.05em]">
                                        {plan.price}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-[var(--muted)] font-medium">for {plan.duration}</div>
                                <p className="mt-5 text-sm leading-7 text-[var(--muted)] font-medium">{plan.description}</p>

                                <div className="my-6 h-px bg-[var(--line-strong)]" />

                                <div className="flex-1 space-y-3">
                                    {plan.items.map((item) => (
                                        <div key={item} className="flex items-start gap-3 text-sm text-[var(--muted)]">
                                            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                                            <span className="font-medium">{item}</span>
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

            <section id="stories" className="section relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Real outcomes"
                        title="Designed for introductions that can"
                        accent="go somewhere"
                        copy="A decent matrimonial homepage should not just look pretty. It should build enough trust that users can imagine a respectful next step."
                    />

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                        <article className="luxury-card surface-card--strong reveal-on-scroll">
                            <div className="mb-5 flex gap-1 text-[var(--gold)]">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <StarIcon key={index} className="h-5 w-5" />
                                ))}
                            </div>
                            <p className="font-display text-[1.9rem] leading-[1.45] text-[var(--text)] sm:text-[2.2rem]">
                                “The redesigned experience feels calm, private, and serious. That changes how people trust the platform.”
                            </p>
                            <div className="mt-8 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--berry)] text-sm font-bold text-white shadow-md">
                                    SP
                                </div>
                                <div>
                                    <div className="font-semibold text-[var(--text)]">Shadii.pk promise</div>
                                    <div className="text-sm text-[var(--muted)]">Privacy, intent, and clean presentation</div>
                                </div>
                            </div>
                        </article>

                        {testimonials.map((story) => (
                            <article key={story.name} className="luxury-card reveal-on-scroll">
                                <div className="mb-4 flex gap-1 text-[var(--gold)]">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <StarIcon key={index} className="h-4 w-4" />
                                    ))}
                                </div>
                                <p className="text-sm leading-7 text-[var(--muted)] font-medium">“{story.quote}”</p>
                                <div className="mt-6 border-t border-[var(--line)] pt-4">
                                    <div className="font-semibold text-[var(--text)]">{story.name}</div>
                                    <div className="text-xs text-[var(--muted)]">{story.city}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="section relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Questions"
                        title="Everything important, without the"
                        accent="clutter"
                        copy="The new FAQ keeps answers readable and properly spaced so the bottom of the page feels as polished as the top."
                    />

                    <div className="luxury-card reveal-on-scroll mx-auto max-w-4xl">
                        {faqs.map((faq, index) => (
                            <details key={faq.question} className="faq-item" open={index === 0}>
                                <summary>
                                    <span className="font-semibold text-[var(--text)]">{faq.question}</span>
                                    <span>+</span>
                                </summary>
                                <p className="font-medium">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section id="download" className="section pb-14 relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <div className="luxury-card surface-card--strong reveal-on-scroll overflow-hidden">
                        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <div className="eyebrow shadow-sm">Ready to begin</div>
                                <h2 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.3rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--text)]">
                                    Start your journey <span className="display-accent">today</span>
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] font-medium">
                                    This rebuild gives the website a proper premium structure. If you want, the same
                                    visual language can now be carried into the admin panel and mobile app screens.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                                <StoreBadge label="Download on the" store="App Store" />
                                <StoreBadge label="Get it on" store="Google Play" />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--berry)] font-bold">
                            {["Free profile setup", "Secure plans", "Private-first experience"].map((item) => (
                                <div key={item} className="rounded-full border border-[var(--gold)]/35 bg-white/70 px-4 py-2 shadow-xs">
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
