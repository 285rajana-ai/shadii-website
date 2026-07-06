"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    BellAlertIcon,
    ChatBubbleLeftRightIcon,
    CheckBadgeIcon,
    CheckCircleIcon,
    CreditCardIcon,
    EyeSlashIcon,
    HeartIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";

const metrics = [
    { value: "50K+", label: "Verified Members" },
    { value: "99%", label: "CNIC Match Rate" },
    { value: "8K+", label: "Serious Matches" },
    { value: "24/7", label: "Manual Moderation" },
];

const features = [
    {
        tag: "01 / IDENTITY",
        title: "Manual CNIC Auditing",
        desc: "We verify Government CNICs alongside live selfie captures to eliminate fake profiles before they can browse matches.",
    },
    {
        tag: "02 / CONTROL",
        title: "The Photo Shield",
        desc: "Choose whether your photos are public, visible only to verified profiles, or unlocked strictly on request.",
    },
    {
        tag: "03 / DISCOVERY",
        title: "Intent-Based Filters",
        desc: "Filter profiles by city, age, sect, marital status, and family background expectations with complete clarity.",
    },
];

const plans = [
    {
        name: "Free Trial",
        price: "0",
        period: "Start safely",
        accent: false,
        items: ["Build verified profile", "Browse limited matches", "Send one matrimonial invite", "Basic safety alerts"],
    },
    {
        name: "Premium Tier",
        price: "2,500",
        period: "3 Months Access",
        accent: true,
        items: ["Unlimited accepted chats", "Direct photo access requests", "View who browsed you", "Priority profile match placement"],
    },
    {
        name: "Elite Council",
        price: "5,000",
        period: "6 Months Access",
        accent: false,
        items: ["Everything in Premium", "Personal match insights", "Monthly profile boost credits", "Priority manual support review"],
    },
];

const faqs = [
    {
        q: "How does Shadii.pk verify profile authenticity?",
        a: "Every member must upload their government-issued CNIC alongside a live capture selfie. Our safety team manually reviews and approves each match card before the profile is active.",
    },
    {
        q: "Are my photos completely private?",
        a: "Yes. By default, photos are kept under a blurred lock mask. Other members can request access, and your images are only visible once you explicitly approve their request.",
    },
    {
        q: "What is the single-message chat rule?",
        a: "To prevent spam, free users can send one introduction message. Once the recipient accepts and replies, the conversation can be unlocked permanently through an active subscription tier.",
    },
];

const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/contact-us", label: "Contact Us" },
];

function ComplianceRail() {
    return (
        <div className="compliance-rail" aria-label="Rapid Gateway compliance links">
            <div>
                <span className="premium-eyebrow">Gateway Ready</span>
                <p>Policies, support details, and plan terms are one tap away.</p>
            </div>
            <div className="compliance-links">
                {legalLinks.map((link) => (
                    <a key={link.href} href={link.href}>
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

const trustSignals = [
    "CNIC and live selfie checks",
    "Photo privacy controls",
    "Family-ready introductions",
    "Safe first-message flow",
];

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];

// Interactive Showcase 1: CNIC Matcher
function VerificationMatcher() {
    const [scanState, setScanState] = useState<"idle" | "scanning" | "matched">("idle");

    const startScan = () => {
        if (scanState === "scanning") return;
        if (scanState === "matched") {
            setScanState("idle");
            return;
        }
        setScanState("scanning");
        setTimeout(() => {
            setScanState("matched");
        }, 2200);
    };

    return (
        <div className={`scan-active-container ${scanState === "scanning" ? "scanning" : ""}`}>
            <div className="scanning-bar" />
            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-[var(--line)] pb-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--gold)]">Verification Engine</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text)]">
                        {scanState === "matched" ? "Match Verified" : scanState === "scanning" ? "Auditing Details" : "Engine Ready"}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="border border-[var(--line)] p-4 flex flex-col items-center justify-center text-center bg-[var(--canvas)]">
                        <div className="w-12 h-12 rounded-full border border-[var(--gold)] bg-white flex items-center justify-center text-xl mb-2">
                            {scanState === "matched" ? "👨" : "👤"}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text)]">User Selfie</span>
                        <span className="text-[8px] text-[var(--muted)]">Live Capture</span>
                    </div>

                    <div className="border border-[var(--line)] p-4 flex flex-col items-center justify-center text-center bg-[var(--canvas)]">
                        <div className="w-12 h-8 rounded border border-dashed border-[var(--gold)] bg-white flex items-center justify-center text-sm mb-3">
                            🪪
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text)]">Govt CNIC</span>
                        <span className="text-[8px] text-[var(--muted)]">Identity Card</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="h-[2px] bg-[var(--line)] w-full overflow-hidden relative">
                        <div className={`h-full bg-[var(--gold)] transition-all duration-[2200ms] ${scanState === "matched" ? "w-full" : "w-0"}`} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-[var(--muted)]">Audit Confidence</span>
                        <span className="text-[var(--gold)]">
                            {scanState === "matched" ? "98% — Match" : scanState === "scanning" ? "Scanning..." : "0%"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={startScan}
                    className="btn-editorial-primary w-full py-3.5 text-[10px] font-bold tracking-widest uppercase mt-2 cursor-pointer"
                >
                    {scanState === "idle" && "Execute Identity Scan"}
                    {scanState === "scanning" && "Auditing Identity..."}
                    {scanState === "matched" && "Reset Scanner"}
                </button>
            </div>
        </div>
    );
}

// Interactive Showcase 2: Photo Shield
function PhotoPrivacySimulator() {
    const [status, setStatus] = useState<"locked" | "requesting" | "unlocked">("locked");

    const requestAccess = () => {
        setStatus("requesting");
        setTimeout(() => {
            setStatus("unlocked");
        }, 1500);
    };

    return (
        <div className="border border-[var(--line)] p-6 bg-white flex flex-col items-center text-center max-w-sm mx-auto w-full">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] mb-4 block">Secured Photo Shield</span>
            
            <div className="private-photo-mask w-24 h-24 rounded-full border border-[var(--line)] mb-4 relative flex items-center justify-center overflow-hidden">
                <div className={`photo-overlay ${status === "unlocked" ? "unlocked" : ""}`}>
                    <LockClosedIcon className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div className={`w-full h-full flex items-center justify-center text-3xl profile-img-blur ${status === "unlocked" ? "unlocked" : ""}`}>
                    👩‍⚕️
                </div>
            </div>

            <div className="mb-4">
                <strong className="font-display italic text-lg text-[var(--text)]">Ayesha M., 25</strong>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted)] mt-1">MBBS Doctor · Lahore</p>
            </div>

            <div className="border-y border-[var(--line)] py-3 w-full my-3 min-h-[3rem] flex items-center justify-center">
                {status === "locked" && (
                    <span className="text-[10px] text-[var(--muted)] font-medium leading-relaxed">Photos remain private to guarantee discovery intent.</span>
                )}
                {status === "requesting" && (
                    <span className="text-[10px] text-[var(--gold)] font-bold tracking-wider animate-pulse">Requesting authorization...</span>
                )}
                {status === "unlocked" && (
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">✓ Consent Granted. Unlocked</span>
                )}
            </div>

            {status === "locked" && (
                <button onClick={requestAccess} className="btn-editorial-primary w-full py-3 text-[10px] tracking-widest uppercase">
                    Request Photo Access
                </button>
            )}
            {status === "requesting" && (
                <button disabled className="btn-editorial-secondary w-full py-3 text-[10px] tracking-widest uppercase opacity-55">
                    Authorizing...
                </button>
            )}
            {status === "unlocked" && (
                <button onClick={() => setStatus("locked")} className="btn-editorial-secondary w-full py-3 text-[10px] tracking-widest uppercase">
                    Re-lock Photo
                </button>
            )}
        </div>
    );
}

// Interactive Showcase 3: Message Flow & Subscription Limit
function ChatLimitSimulator() {
    const [stage, setStage] = useState<"idle" | "sent" | "replying" | "limited">("idle");

    const startChat = () => {
        setStage("sent");
        setTimeout(() => {
            setStage("replying");
            setTimeout(() => {
                setStage("limited");
            }, 1000);
        }, 1200);
    };

    return (
        <div className="border border-[var(--line)] p-4 bg-white max-w-md mx-auto w-full flex flex-col justify-between min-h-[20rem]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] text-center mb-3 block">Conversational Rules Flow</span>
            
            <div className="chat-box-mockup flex-1 mb-4">
                {stage === "idle" ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <span className="text-2xl mb-2 text-[var(--gold)]">✉️</span>
                        <p className="text-[10px] text-[var(--muted)] max-w-[18rem]">Demonstrate the respectful introduction rule that blocks bulk matchmaking spam.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bubble-mockup sent">
                            Assalam-o-Alaikum, I reviewed your education background and marital status details. I would love to connect.
                        </div>
                        {(stage === "replying" || stage === "limited") && (
                            <div className="bubble-mockup received">
                                Walaikum Assalam, thank you for reaching out. Yes, we can chat here to discuss family background details.
                            </div>
                        )}
                        {stage === "limited" && (
                            <div className="chat-warning-overlay mt-4">
                                <span className="text-[10px] font-bold text-[var(--berry)] tracking-wider block mb-1">Reply limit reached</span>
                                <p className="text-[9px] text-[var(--muted)] mb-3">Upgrade to Premium to continue your safe matrimonial discussion.</p>
                                <a href="#pricing" className="btn-editorial-primary py-2 px-6 text-[9px] tracking-wider uppercase">
                                    View Subscriptions
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {stage === "idle" ? (
                <button onClick={startChat} className="btn-editorial-primary w-full py-3 text-[10px] tracking-widest uppercase">
                    Send Matrimonial Invite
                </button>
            ) : (
                <button onClick={() => setStage("idle")} className="btn-editorial-secondary w-full py-3 text-[10px] tracking-widest uppercase">
                    Restart Conversation
                </button>
            )}
        </div>
    );
}

function MatchConsole() {
    const [age, setAge] = useState(26);
    const [city, setCity] = useState("Lahore");
    const [verifiedOnly, setVerifiedOnly] = useState(true);

    const profiles = useMemo(() => {
        const base = city.charCodeAt(0) + age;
        return [
            { name: "Mariam A.", detail: `${city} · Masters · Never married`, score: 93 + (base % 4) },
            { name: "Zainab K.", detail: `${city} · Software Engineer · Sunni`, score: 89 + (base % 5) },
            { name: "Hina R.", detail: `${city} · Doctor · Family reviewed`, score: 86 + (base % 6) },
        ];
    }, [age, city]);

    return (
        <div className="border border-[var(--line)] bg-white p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex flex-col justify-center">
                <span className="editorial-eyebrow">Matchmaking filters</span>
                <h3 className="font-display text-4xl text-[var(--text)] leading-tight mb-6">
                    Discovery with <em>refined expectations.</em>
                </h3>
                <p className="text-[var(--muted)] text-xs leading-relaxed mb-6">
                    Focus on criteria that matter rather than endless swiping. Filter profiles immediately to view matched candidates.
                </p>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-[var(--muted)]">Preferred age</span>
                            <span className="text-[var(--gold)]">{age} years</span>
                        </div>
                        <input min="20" max="45" value={age} onChange={(event) => setAge(Number(event.target.value))} type="range" className="luxury-slider cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Location</span>
                            <select value={city} onChange={(event) => setCity(event.target.value)} className="luxury-input text-sm py-2">
                                {cities.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col justify-end">
                            <button
                                type="button"
                                onClick={() => setVerifiedOnly((value) => !value)}
                                className={`btn-editorial-secondary py-2.5 text-[9px] tracking-widest uppercase cursor-pointer ${
                                    verifiedOnly ? "!bg-[var(--text)] !text-white" : ""
                                }`}
                            >
                                {verifiedOnly ? "Verified Only" : "All Profiles"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
                {profiles.map((profile, index) => (
                    <article key={profile.name} className="border border-[var(--line)] p-4 bg-[var(--canvas)] flex justify-between items-center transition-all hover:border-[var(--gold)]">
                        <div>
                            <span className="text-[9px] font-bold text-[var(--gold)] tracking-widest block mb-1">0{index + 1} / PROFILE</span>
                            <strong className="text-sm font-display italic text-[var(--text)] block">{profile.name}</strong>
                            <span className="text-[10px] text-[var(--muted)] mt-0.5 block">{profile.detail}</span>
                        </div>
                        <div className="w-10 h-10 border border-[var(--gold)] rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--gold)]">
                            {profile.score}%
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen bg-[var(--canvas)] selection:bg-[var(--rose)] selection:text-[var(--berry)]">
            <Navbar />

            {/* Hero Section */}
            <section className="section pt-36 pb-24 relative overflow-hidden parallax-section">
                <div className="site-shell grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Copy Block */}
                    <div className="editorial-reveal">
                        <span className="editorial-eyebrow">Pakistan&apos;s Premium Matrimony</span>
                        <h1 className="font-display text-5xl md:text-7xl leading-[1.08] text-[var(--text)]">
                            Serious matchmaking, <br />refined for <br />
                            <span className="italic text-[var(--gold)] font-medium">modern families.</span>
                        </h1>
                        <p className="mt-8 text-sm leading-relaxed text-[var(--muted)] max-w-md">
                            Shadii.pk introduces an editorial matchmaking standard for Pakistani families. 
                            Manual CNIC verification, robust photo privacy shields, and structured connections provide a calm path to marriage.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-10">
                            <a href="/portal/register?plan=free" className="btn-editorial-primary">
                                Begin Journey
                            </a>
                            <a href="/portal/login" className="btn-editorial-secondary">
                                Enter Portal
                            </a>
                        </div>

                        {/* Trust Signals bar */}
                        <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-[var(--line)]">
                            {trustSignals.map((signal) => (
                                <div key={signal} className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{signal}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right 3D Visual Mockup */}
                    <div className="relative w-full h-[40rem] flex items-center justify-center phone-frame-container">
                        {/* Floating Tag 1 */}
                        <div className="absolute top-16 left-4 z-20 border border-[var(--line)] bg-white p-4 flex gap-3 items-center shadow-[0_20px_45px_rgba(0,0,0,0.02)] scroll-parallax-slow">
                            <ShieldCheckIcon className="w-5 h-5 text-[var(--gold)]" />
                            <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text)]">Verified Candidate</span>
                                <span className="block text-[8px] text-[var(--muted)]">CNIC & Selfie Match 98%</span>
                            </div>
                        </div>

                        {/* Phone Container */}
                        <div className="phone-frame">
                            <div className="flex justify-between items-center border-b border-[var(--line)] pb-3 mb-4">
                                <span className="text-[9px] font-bold tracking-widest uppercase text-[var(--text)]">Shadii.pk</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            
                            <div className="w-24 h-24 rounded-full border border-[var(--gold)] bg-[var(--canvas)] mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner">
                                👨
                            </div>

                            <div className="text-center mb-6">
                                <strong className="font-display italic text-lg text-[var(--text)] block">Mohsin R., 28</strong>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Software Eng · Islamabad</span>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="border border-[var(--line)] p-2.5 bg-[var(--canvas-deep)]">
                                    <span className="block text-[8px] text-[var(--muted)] uppercase tracking-wider">Identity Audit</span>
                                    <span className="text-[9px] font-bold text-emerald-800">✓ Govt CNIC Verified</span>
                                </div>
                                <div className="border border-[var(--line)] p-2.5 bg-[var(--canvas-deep)]">
                                    <span className="block text-[8px] text-[var(--muted)] uppercase tracking-wider">Security State</span>
                                    <span className="text-[9px] font-bold text-[var(--gold)]">Photo Access Request Enabled</span>
                                </div>
                            </div>

                            <button className="btn-editorial-primary w-full py-2.5 text-[9px] tracking-widest uppercase" type="button">
                                Send Invite
                            </button>
                        </div>

                        {/* Floating Tag 2 */}
                        <div className="absolute bottom-24 right-4 z-20 border border-[var(--line)] bg-white p-4 flex gap-3 items-center shadow-[0_20px_45px_rgba(0,0,0,0.02)] scroll-parallax-fast">
                            <EyeSlashIcon className="w-5 h-5 text-[var(--berry)]" />
                            <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text)]">Photo Lock</span>
                                <span className="block text-[8px] text-[var(--muted)]">Blurred until accepted</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Metric Strip */}
                <div className="site-shell mt-16 pt-12 border-t border-[var(--line)]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {metrics.map((metric) => (
                            <div key={metric.label} className="text-center md:text-left border-l border-[var(--line)] pl-4">
                                <strong className="font-display text-4xl text-[var(--berry)] block leading-none">{metric.value}</strong>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] mt-2 block">{metric.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Manifesto Section */}
            <section className="section bg-[#0f1110] text-[#f7f5f0]">
                <div className="site-shell py-12 text-center max-w-3xl mx-auto">
                    <span className="editorial-eyebrow">Our Manifesto</span>
                    <h2 className="font-display text-4xl md:text-6xl leading-tight mb-8">
                        Matrimony is not an <em>interface for swiping.</em>
                    </h2>
                    <div className="w-16 h-[1px] bg-[var(--gold)] mx-auto mb-8" />
                    <p className="text-sm opacity-65 leading-relaxed tracking-wide">
                        We believe that serious life partner searches should be built around family values, verified identities, 
                        and absolute respect. We remove noise and focus entirely on the quiet, serious process of marriage matchmaking.
                    </p>
                </div>
            </section>

            {/* Core Pillars / Bento Grid Features */}
            <section id="features" className="section">
                <div className="site-shell">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="editorial-eyebrow">Platform Architecture</span>
                        <h2 className="font-display text-4xl text-[var(--text)]">
                            Timeless design, built for <em>serious intent.</em>
                        </h2>
                    </div>

                    <div className="bento-container">
                        <div className="bento-item col-span-12 md:col-span-8">
                            <span className="text-[10px] font-bold text-[var(--gold)] tracking-widest block mb-4">IDENTITY</span>
                            <h3 className="font-display text-2xl mb-4 text-[var(--text)]">Manual Government Verification</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
                                Every profile uploaded is cross-referenced manually against official government details and user selfie captures. 
                                We completely eliminate bots and fake rishta proposals.
                            </p>
                        </div>
                        <div className="bento-item col-span-12 md:col-span-4">
                            <span className="text-[10px] font-bold text-[var(--gold)] tracking-widest block mb-4">PRIVACY</span>
                            <h3 className="font-display text-2xl mb-4 text-[var(--text)]">Complete Photo Shields</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                Photos are blurred by default, allowing you to select who views them or to share them only on individual request.
                            </p>
                        </div>
                        <div className="bento-item col-span-12 md:col-span-4">
                            <span className="text-[10px] font-bold text-[var(--gold)] tracking-widest block mb-4">DISCOVERY</span>
                            <h3 className="font-display text-2xl mb-4 text-[var(--text)]">Criteria Search</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                Filter match selections by education, city location, cast sect, expectations, and family background variables.
                            </p>
                        </div>
                        <div className="bento-item col-span-12 md:col-span-8">
                            <span className="text-[10px] font-bold text-[var(--gold)] tracking-widest block mb-4">MESSAGING</span>
                            <h3 className="font-display text-2xl mb-4 text-[var(--text)]">Respectful Matrimonial Invite Rules</h3>
                            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
                                Direct messaging requires consent. Free members can send one initial matrimonial request invitation, ensuring 
                                conversation continues only when both sides are serious and comfortable.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Simulators Showcase */}
            <section className="section bg-[var(--canvas-deep)]">
                <div className="site-shell">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="editorial-eyebrow">Interactive Engine Study</span>
                        <h2 className="font-display text-4xl text-[var(--text)]">
                            Experience the <em>product logic.</em>
                        </h2>
                        <p className="text-xs text-[var(--muted)] mt-4">
                            Interact with the elements below to understand the verification, visibility, and chat rules we enforce.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Sim 1 */}
                        <div>
                            <span className="editorial-eyebrow text-center lg:text-left">01 / Verification Scan</span>
                            <VerificationMatcher />
                        </div>
                        {/* Sim 2 */}
                        <div>
                            <span className="editorial-eyebrow text-center lg:text-left">02 / Photo Authorize</span>
                            <PhotoPrivacySimulator />
                        </div>
                        {/* Sim 3 */}
                        <div>
                            <span className="editorial-eyebrow text-center lg:text-left">03 / Conversation Rule</span>
                            <ChatLimitSimulator />
                        </div>
                    </div>
                </div>
            </section>

            {/* MatchConsole Section */}
            <section className="section">
                <div className="site-shell">
                    <MatchConsole />
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="section bg-[var(--canvas-deep)]">
                <div className="site-shell">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="editorial-eyebrow">Subscription Pricing</span>
                        <h2 className="font-display text-4xl text-[var(--text)]">
                            Intent-Based <em>Tiers & Options</em>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {plans.map((plan) => (
                            <div key={plan.name} className={`border p-8 bg-white flex flex-col justify-between relative ${
                                plan.accent ? "border-[var(--gold)] shadow-[0_20px_50px_rgba(199,125,99,0.06)]" : "border-[var(--line)]"
                            }`}>
                                {plan.accent && (
                                    <span className="absolute -top-3.5 right-6 px-3 py-1 bg-[var(--gold)] text-white text-[8px] font-bold uppercase tracking-widest">
                                        Council Pick
                                    </span>
                                )}
                                <div>
                                    <span className="text-[10px] font-bold tracking-widest text-[var(--gold)] uppercase">{plan.name}</span>
                                    <div className="flex items-baseline gap-1 mt-4">
                                        <span className="text-sm text-[var(--muted)] font-medium">PKR</span>
                                        <strong className="font-display text-5xl text-[var(--berry)] font-medium leading-none">{plan.price}</strong>
                                    </div>
                                    <p className="text-[10px] text-[var(--muted)] font-bold tracking-wider mt-2 uppercase">{plan.period}</p>

                                    <ul className="mt-8 space-y-4">
                                        {plan.items.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                                                <CheckCircleIcon className="w-4 h-4 text-[var(--gold)] flex-shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <a href="/portal/register?plan=free" className="btn-editorial-primary w-full text-center py-3.5 text-[9px] tracking-widest uppercase mt-10">
                                    {plan.name === "Free Trial" ? "Register Free" : `Activate ${plan.name}`}
                                </a>
                            </div>
                        ))}
                    </div>

                    <ComplianceRail />
                </div>
            </section>

            {/* Trust Testimonials */}
            <section className="section">
                <div className="site-shell grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 pr-4">
                        <div className="flex gap-1 text-[var(--gold)] mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon key={i} className="w-4 h-4" />
                            ))}
                        </div>
                        <h2 className="font-display text-3xl md:text-5xl leading-tight text-[var(--text)]">
                            Platform trust is not an aesthetic garnish. It is a <em>quiet matrimonial commitment.</em>
                        </h2>
                        <p className="text-xs leading-relaxed text-[var(--muted)] mt-6 max-w-lg">
                            We manually review CNIC credentials, lock photo displays by default, and structure messaging 
                            options to keep matrimonial intention serious. We treat matchmaking with the respect your family deserves.
                        </p>
                        
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--line)] max-w-xs">
                            <span className="w-8 h-8 rounded-full bg-[var(--berry)] text-white flex items-center justify-center text-xs font-bold font-display italic">SP</span>
                            <div>
                                <strong className="text-xs text-[var(--text)] block">Matrimonial Verification Council</strong>
                                <span className="text-[9px] text-[var(--muted)] font-bold tracking-wider uppercase block mt-0.5">Shadii.pk Standards</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                        {[
                            ["CNIC Audit Controls", "Every profile undergoes government identity checks before approval."],
                            ["First-Message Rules", "Introduction invites block match spammers from accessing matches."],
                            ["Gateway Compliant Rails", "All policies and subscriptions follow rapid compliance rules."],
                        ].map(([title, desc]) => (
                            <div key={title} className="border border-[var(--line)] p-5 bg-[var(--canvas-deep)]">
                                <SparklesIcon className="w-4 h-4 text-[var(--gold)] mb-3" />
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">{title}</h4>
                                <p className="text-[11px] text-[var(--muted)] mt-1.5 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section id="faq" className="section bg-[var(--canvas-deep)]">
                <div className="site-shell grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-5">
                        <span className="editorial-eyebrow">Clarifications</span>
                        <h2 className="font-display text-4xl text-[var(--text)] leading-tight">
                            Common questions, <em>clear policies.</em>
                        </h2>
                        <p className="text-xs text-[var(--muted)] leading-relaxed mt-4 max-w-sm">
                            We details all rules regarding identity audits, subscription packages, and photo locks clearly.
                        </p>
                    </div>

                    <div className="lg:col-span-7 space-y-3 bg-white border border-[var(--line)] p-6">
                        {faqs.map((faq, i) => (
                            <details key={faq.q} open={i === 0} className="border-b border-[var(--line)] py-4 last:border-0 last:pb-0 first:pt-0">
                                <summary className="flex justify-between items-center cursor-pointer font-bold text-xs uppercase tracking-widest text-[var(--text)] outline-none">
                                    <span>{faq.q}</span>
                                    <span className="text-[var(--gold)] text-lg">+</span>
                                </summary>
                                <p className="text-xs text-[var(--muted)] leading-relaxed mt-3">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final Invitation */}
            <section className="section pb-24 pt-20">
                <div className="site-shell">
                    <div className="border border-[var(--line)] p-12 md:p-20 text-center bg-white relative overflow-hidden">
                        <MapPinIcon className="w-8 h-8 text-[var(--gold)] mx-auto mb-6" />
                        <span className="editorial-eyebrow">matrimonial portal</span>
                        <h2 className="font-display text-4xl md:text-5xl text-[var(--text)] mt-4 leading-tight">
                            Begin your matrimonial search <em>respectfully.</em>
                        </h2>
                        <p className="max-w-md mx-auto text-xs text-[var(--muted)] mt-6 leading-relaxed">
                            Create your verified matrimonial profile, check CNIC details, and find life partners with absolute privacy.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 justify-center mt-10">
                            <a href="/portal/register?plan=free" className="btn-editorial-primary">
                                Register Profile
                            </a>
                            <a href="/contact-us" className="btn-editorial-secondary">
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
