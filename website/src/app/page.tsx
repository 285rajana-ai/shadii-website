"use client";

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
import { useState } from "react";

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
            <h2 className="section-title text-[var(--text)]">
                {title}
                {accent ? (
                    <>
                        {" "}
                        <span className="display-accent text-[var(--berry)] italic">{accent}</span>
                    </>
                ) : null}
            </h2>
            <p className="section-copy mt-4 text-[var(--muted)]">{copy}</p>
        </div>
    );
}

function StoreBadge({ label, store }: { label: string; store: string }) {
    const isApple = store === "App Store";
    return (
        <a href="#" className="inline-flex items-center gap-4 min-w-[13rem] px-5 py-3.5 rounded-2xl border border-[var(--gold)] bg-white hover:bg-stone-50 hover:border-[var(--berry)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(194,155,87,0.08)] shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#801830,#c09950)] text-white shadow-sm shrink-0">
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
            <span className="text-left">
                <small className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</small>
                <strong className="block text-sm font-bold text-[var(--text)] mt-0.5">{store}</strong>
            </span>
        </a>
    );
}

function MatchSimulator() {
    const [age, setAge] = useState(25);
    const [city, setCity] = useState("Lahore");
    const [sect, setSect] = useState("Sunni");
    const [gender, setGender] = useState<"female" | "male">("female");

    const getProfiles = () => {
        const occupations: Record<"female" | "male", string[]> = {
            female: ["MBBS Doctor", "Software Engineer", "Clinical Psychologist", "Lecturer", "Chartered Accountant"],
            male: ["Software Architect", "Business Director", "Civil Engineer", "Corporate Lawyer", "Finance Analyst"]
        };
        const education: Record<"female" | "male", string[]> = {
            female: ["MD / MBBS (KEMU)", "Bachelors in CS (FAST)", "M.Phil Psychology", "Masters in English (PU)", "CA Finalist"],
            male: ["MS in CS (ITU)", "MBA (LUMS)", "BE Civil (UET)", "LLM (London)", "FCA"]
        };
        
        return [
            {
                name: gender === "female" ? "Ayesha" : "Zain",
                age: age - 1,
                role: occupations[gender][0],
                education: education[gender][0],
                compatibility: 96,
            },
            {
                name: gender === "female" ? "Zainab" : "Ahmed",
                age: age,
                role: occupations[gender][1],
                education: education[gender][1],
                compatibility: 93,
            },
            {
                name: gender === "female" ? "Mariam" : "Usman",
                age: age + 2,
                role: occupations[gender][2],
                education: education[gender][2],
                compatibility: 89,
            }
        ];
    };

    const matchesCount = (age * 18) + (city.charCodeAt(0) * 12) + (sect === "Sunni" ? 140 : 85);

    return (
        <div className="luxury-card--light relative z-10 max-w-5xl mx-auto my-12 p-8 overflow-hidden rounded-[2.2rem] border border-[var(--gold)]/35 text-[var(--text)]">
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[var(--gold)]/5 to-transparent pointer-events-none" />
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                {/* Simulator Inputs */}
                <div className="flex flex-col justify-between space-y-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--berry)]">Interactive Experience</span>
                        <h3 className="mt-2 font-display text-3xl font-bold text-[var(--text)]">Rishta Match Simulator</h3>
                        <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
                            Simulate how our platform connects serious members. Adjust filters below to view mock verified matches.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Gender selection */}
                        <div className="flex gap-4 items-center">
                            <span className="text-xs font-bold text-[var(--muted)] min-w-[80px]">Looking For:</span>
                            <div className="flex gap-2">
                                {["female", "male"].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g as "female" | "male")}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            gender === g 
                                                ? "bg-[var(--berry)] border-[var(--berry)] !text-white" 
                                                : "bg-white border-[var(--gold)]/35 text-[var(--text)] hover:bg-stone-50"
                                        }`}
                                        style={gender === g ? { color: '#ffffff' } : undefined}
                                    >
                                        {g === "female" ? "Bride (Larki)" : "Groom (Larka)"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age range slider */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                                <span>Preferred Age:</span>
                                <span className="text-[var(--berry)]">{age} years</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="45"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value))}
                                className="luxury-slider"
                            />
                        </div>

                        {/* City select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[var(--muted)]">City / Location:</label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="luxury-input"
                            >
                                <option value="Lahore">Lahore</option>
                                <option value="Karachi">Karachi</option>
                                <option value="Islamabad">Islamabad</option>
                                <option value="Faisalabad">Faisalabad</option>
                                <option value="Multan">Multan</option>
                                <option value="Peshawar">Peshawar</option>
                            </select>
                        </div>

                        {/* Sect selection */}
                        <div className="flex gap-4 items-center">
                            <span className="text-xs font-bold text-[var(--muted)] min-w-[80px]">Sect:</span>
                            <div className="flex gap-2">
                                {["Sunni", "Shia", "Any"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSect(s)}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                                            sect === s
                                                ? "bg-[var(--berry)] border-[var(--berry)] !text-white"
                                                : "bg-white border-[var(--gold)]/35 text-[var(--text)] hover:bg-stone-50"
                                        }`}
                                        style={sect === s ? { color: '#ffffff' } : undefined}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-bold">Estimated Pool</div>
                            <div className="text-xl font-bold text-[var(--text)] mt-0.5">{matchesCount}+ Active Profiles</div>
                        </div>
                        <a href="#download" className="inline-flex items-center justify-center min-h-[2.8rem] rounded-full px-5 text-xs font-bold bg-[var(--berry)] !text-white hover:bg-[#681023] transition-all" style={{ color: '#ffffff' }}>
                            Find Yours Now
                        </a>
                    </div>
                </div>

                {/* Simulator Outputs Display */}
                <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">
                        Compatible Verified Matches:
                    </div>
                    <div className="space-y-3">
                        {getProfiles().map((profile) => (
                            <div
                                key={profile.name}
                                className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm hover:border-[var(--berry)]/30 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 bg-[var(--berry)]/5 text-[var(--berry)] text-[9px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-stone-100">
                                    {profile.compatibility}% Match
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Blurred avatar */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(194,155,80,0.1),rgba(128,24,48,0.05))] border border-stone-100 text-xs font-bold text-[var(--berry)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-stone-100 blur-[3px]" />
                                        <span className="relative z-10">{profile.name[0]}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--text)]">
                                            {profile.name}, {profile.age}
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--berry)]/10 text-[var(--berry)] text-[10px] font-bold">✓</span>
                                        </div>
                                        <div className="text-[10px] text-[var(--muted)] font-medium">{city} · {profile.role} · {profile.education}</div>
                                    </div>
                                </div>
                                <div className="mt-3 rounded-xl bg-[var(--canvas)] border border-stone-100 px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)] font-medium">
                                    🔒 Photo blurred for privacy · CNIC and live selfie checked.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <main className="page-shell overflow-x-hidden">
            <Navbar />

            {/* Video Background Layer inside light hero block */}
            <div className="relative z-10 bg-gradient-to-b from-[var(--canvas)] via-[var(--canvas)] to-[var(--canvas-deep)] pt-36 pb-20 sm:pt-40 lg:pt-44 lg:pb-32 overflow-hidden border-b border-[var(--gold)]/20">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover opacity-[0.04] mix-blend-multiply"
                        style={{ filter: "sepia(20%) saturate(120%) brightness(100%)" }}
                    >
                        <source src="https://videos.pexels.com/video-files/7525287/7525287-uhd_2560_1440_24fps.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--canvas)]/20 via-transparent to-[var(--canvas-deep)]" />
                </div>

                <div className="site-shell relative z-10">
                    <div className="grid items-center gap-12 xl:grid-cols-[1.15fr_0.85fr] xl:gap-16">
                        <div>
                            <div className="eyebrow shadow-xs bg-white/50 border-[var(--gold)]/35 text-[var(--berry)]">
                                Pakistan&apos;s Premium Matrimonial Platform
                            </div>
                            <h1 className="hero-title mt-6 max-w-4xl font-display text-[clamp(3.3rem,9vw,5.5rem)] font-bold leading-[1.0] tracking-[-0.04em] text-[var(--text)]">
                                Find your <span className="text-[var(--berry)] italic">life partner</span> with dignity & discretion.
                            </h1>
                            <p className="hero-copy mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg font-medium">
                                Shadii.pk is built for serious individuals and families seeking meaningful matrimonial introductions. Experience a calmer matchmaking process with verified profiles, complete photo privacy, and zero social swiping clutter.
                            </p>

                            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a href="#download" className="inline-flex items-center justify-center gap-3 min-h-[3.35rem] rounded-full px-7 text-base font-bold bg-[var(--berry)] !text-white hover:bg-[#681023] transition-all" style={{ color: '#ffffff' }}>
                                    Download App
                                    <ArrowRightIcon className="h-5 w-5 text-white" />
                                </a>
                                <a href="#about" className="inline-flex items-center justify-center gap-3 min-h-[3.35rem] rounded-full px-7 text-base font-bold border border-[var(--gold)] bg-white/70 text-[var(--berry)] hover:bg-white transition-all">
                                    Explore Features
                                </a>
                            </div>

                            <div className="hero-trust mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted)] font-semibold">
                                {[
                                    "CNIC + Selfie Verification",
                                    "Private Photos & Safe Chat",
                                    "Family-Backed Introductions",
                                ].map((item, idx) => (
                                    <div key={item} className="inline-flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-[var(--berry)]" />
                                        <span>{item}</span>
                                        {idx < 2 && <span className="hidden sm:inline text-[var(--gold)] ml-4">•</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive phone frame showcase without overlapping badge clutter */}
                        <div className="hero-showcase flex items-center justify-center py-6 select-none relative">
                            {/* Rotating gold background decoration */}
                            <div className="absolute h-96 w-96 rounded-full border border-[var(--gold)]/10 animate-[spin_45s_linear_infinite]" />
                            <div className="absolute h-80 w-80 rounded-full border border-dashed border-[var(--gold)]/20 animate-[spin_20s_linear_infinite]" />

                            <div className="phone-frame relative z-10 border-[10px] border-[#2e2424] shadow-[0_20px_50px_rgba(194,155,87,0.1)]">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-metrics mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative z-10">
                        {heroStats.map((item) => (
                            <div key={item.label} className="metric-tile bg-white border-[var(--gold)]/20 hover:border-[var(--gold)]/50">
                                <div className="font-display text-4xl font-bold tracking-[-0.04em] text-[var(--berry)]">
                                    {item.value}
                                </div>
                                <div className="mt-2 text-sm text-[var(--muted)] font-medium">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Us Section (Light Theme staggered layout) */}
            <section id="about" className="section bg-[var(--canvas)] relative z-10">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Why this version is better"
                        title="A homepage rebuilt for"
                        accent="clarity"
                        copy="Every section now follows a cleaner layout rhythm, with stronger hierarchy, balanced grids, and components that stay in place instead of fighting each other."
                    />

                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 pt-6">
                        {pillars.map((item, idx) => {
                            const Icon = item.icon;
                            const staggerClass = idx === 1 || idx === 4 
                                ? "xl:translate-y-6" 
                                : idx === 2 || idx === 5 
                                ? "xl:translate-y-12" 
                                : "";
                            
                            return (
                                <article 
                                    key={item.title} 
                                    className={`luxury-card corner-ornament-card bg-white border-[var(--gold)]/20 hover:border-[var(--gold)]/50 transition-all duration-300 reveal-on-scroll ${staggerClass}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(194,155,87,0.1),rgba(139,38,62,0.05))] text-[var(--berry)] border border-[var(--line-strong)]">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--berry)] mt-1.5">
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

            {/* Interactive Match Simulator Section */}
            <section className="section bg-[var(--canvas-deep)] relative z-10 py-16 border-y border-[var(--gold)]/20">
                <div className="site-shell">
                    <MatchSimulator />
                </div>
            </section>

            {/* Asymmetric Zigzag Timeline Steps */}
            <section id="journey" className="section bg-[var(--canvas)] relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Simple journey"
                        title="From profile setup to"
                        accent="real conversation"
                        copy="The rebuild keeps the flow straightforward. Instead of a crowded landing page, each section now earns its place and leads naturally into the next."
                    />

                    <div className="timeline-container mt-16 space-y-12">
                        {steps.map((step, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <div 
                                    key={step.number} 
                                    className={`flex flex-col lg:flex-row ${isEven ? "" : "lg:flex-row-reverse"} items-stretch gap-8 relative`}
                                >
                                    {/* Timeline dot */}
                                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--gold)] bg-white shadow-md z-10 font-bold text-xs text-[var(--berry)]">
                                        {step.number}
                                    </div>

                                    {/* Left/Right content blocker */}
                                    <div className="w-full lg:w-[46%] flex items-center">
                                        <article className="luxury-card bg-white w-full border-[var(--gold)]/20 hover:border-[var(--gold)]/50 transition-all duration-300">
                                            <div className="flex flex-col gap-4">
                                                <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white font-display text-sm font-bold text-[var(--berry)] shadow-sm">
                                                    {step.number}
                                                </div>
                                                <h3 className="font-display text-[1.65rem] font-bold leading-tight text-[var(--text)]">
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm leading-7 text-[var(--muted)] font-medium">{step.text}</p>
                                            </div>
                                        </article>
                                    </div>

                                    {/* Empty structural blocker for zigzag layout */}
                                    <div className="hidden lg:block lg:w-[8%]" />
                                    <div className="hidden lg:block lg:w-[46%]" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Plans (Light Theme luxury ticket pricing) */}
            <section id="plans" className="section relative z-10 bg-[var(--canvas-deep)] border-y border-[var(--gold)]/20">
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Straight pricing"
                        title="Clean plans for a"
                        accent="serious search"
                        copy="No clutter, no awkward pricing mess. The plan section now reads clearly and keeps the premium option visibly highlighted without breaking the layout."
                    />

                    <div className="grid gap-8 xl:grid-cols-3 mt-12">
                        {planCards.map((plan) => (
                            <article
                                key={plan.name}
                                className={[
                                    "luxury-card bg-white flex h-full flex-col relative",
                                    plan.featured ? "border-2 border-[var(--berry)] shadow-[0_15px_40px_rgba(128,24,48,0.08)] translate-y-[-4px]" : "border-[var(--gold)]/35",
                                ].join(" ")}
                            >
                                {plan.featured ? (
                                    <div className="absolute top-5 right-5 rounded-md bg-[var(--berry)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
                                        Most popular
                                    </div>
                                ) : null}

                                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--berry)]">
                                    {plan.name}
                                </div>
                                <div className="mt-4 flex items-end gap-2 text-[var(--text)]">
                                    <span className="mb-2 text-sm font-semibold text-[var(--muted)]">PKR</span>
                                    <span className="font-display text-[3.4rem] font-bold tracking-[-0.05em]">
                                        {plan.price}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-[var(--muted)] font-medium">for {plan.duration}</div>
                                <p className="mt-5 text-xs leading-6 text-[var(--muted)] font-medium">{plan.description}</p>

                                <div className="my-6 h-px bg-stone-100" />

                                <div className="flex-1 space-y-3">
                                    {plan.items.map((item) => (
                                        <div key={item} className="flex items-start gap-3 text-xs text-[var(--muted)]">
                                            <CheckCircleIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[var(--berry)]" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <a href="#download" className={`mt-8 inline-flex items-center justify-center min-h-[3rem] rounded-full px-5 text-sm font-bold transition-all ${
                                    plan.featured 
                                        ? "bg-[var(--berry)] !text-white hover:bg-[#681023]" 
                                        : "border border-[var(--gold)] bg-transparent text-[var(--berry)] hover:bg-stone-50"
                                }`} style={plan.featured ? { color: '#ffffff' } : undefined}>
                                    Choose {plan.name}
                                </a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="stories" className="section bg-[var(--canvas)] relative z-10">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Real outcomes"
                        title="Designed for introductions that can"
                        accent="go somewhere"
                        copy="A decent matrimonial homepage should not just look pretty. It should build enough trust that users can imagine a respectful next step."
                    />

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                        <article className="luxury-card bg-white border-[var(--gold)]/35 shadow-lg reveal-on-scroll flex flex-col justify-between p-8">
                            <div>
                                <div className="mb-5 flex gap-1 text-[var(--gold)]">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <StarIcon key={index} className="h-5 w-5" />
                                    ))}
                                </div>
                                <p className="font-display text-[1.8rem] leading-[1.45] text-[var(--text)] sm:text-[2rem] font-bold">
                                    “The redesigned experience feels calm, private, and serious. That changes how people trust the platform.”
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-3 border-t border-[var(--line-strong)]/30 pt-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--berry)] text-sm font-bold text-white shadow-md">
                                    SP
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--text)]">Shadii.pk promise</div>
                                    <div className="text-xs text-[var(--muted)]">Privacy, intent, and clean presentation</div>
                                </div>
                            </div>
                        </article>

                        {testimonials.map((story) => (
                            <article key={story.name} className="luxury-card bg-white border-[var(--gold)]/20 shadow-md reveal-on-scroll flex flex-col justify-between p-8">
                                <div>
                                    <div className="mb-4 flex gap-1 text-[var(--gold)]">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <StarIcon key={index} className="h-4 w-4" />
                                        ))}
                                    </div>
                                    <p className="text-xs leading-6 text-[var(--muted)] font-medium">“{story.quote}”</p>
                                </div>
                                <div className="mt-6 border-t border-[var(--line)] pt-4">
                                    <div className="font-bold text-[var(--text)]">{story.name}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-bold">{story.city}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="section bg-[var(--canvas-deep)] relative z-10 border-y border-[var(--gold)]/20">
                <FiligreeDivider />
                <div className="site-shell">
                    <SectionLead
                        eyebrow="Questions"
                        title="Everything important, without the"
                        accent="clutter"
                        copy="The new FAQ keeps answers readable and properly spaced so the bottom of the page feels as polished as the top."
                    />

                    <div className="luxury-card bg-white border-[var(--gold)]/25 mx-auto max-w-4xl shadow-lg">
                        {faqs.map((faq, index) => (
                            <details key={faq.question} className="faq-item" open={index === 0}>
                                <summary className="py-5 font-semibold text-[var(--text)] border-b border-stone-100 hover:text-[var(--berry)] transition-colors">
                                    <span>{faq.question}</span>
                                    <span>+</span>
                                </summary>
                                <p className="font-medium text-sm mt-3">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download CTA Card (Rebuilt completely as an elegant light theme invite card - no clutter, no broken layout) */}
            <section id="download" className="section pb-20 pt-10 relative z-10 bg-[var(--canvas)]">
                <FiligreeDivider />
                <div className="site-shell">
                    <div className="luxury-card bg-white relative overflow-hidden py-14 px-8 md:px-12 border border-[var(--gold)]/35 shadow-xl text-[var(--text)]">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                            <div>
                                <span className="eyebrow">Ready to begin</span>
                                <h2 className="mt-6 font-display text-[clamp(2.3rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.04em] text-[var(--text)]">
                                    Start your journey <span className="text-[var(--berry)] italic">today</span>
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--muted)] font-medium">
                                    Create your secure profile, complete CNIC verification, and begin introducing yourself to compatible members. Get the Shadii.pk app directly for your mobile device.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row justify-center w-full max-w-md pt-2">
                                <StoreBadge label="Download on the" store="App Store" />
                                <StoreBadge label="Get it on" store="Google Play" />
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 text-sm text-[var(--berry)] font-bold border-t border-stone-100 w-full">
                                <span>Free profile setup</span>
                                <span className="text-[var(--gold)] select-none">•</span>
                                <span>Secure plans</span>
                                <span className="text-[var(--gold)] select-none">•</span>
                                <span>Private-first experience</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
