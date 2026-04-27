"use client";

import {
    BellIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    CheckBadgeIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    UserIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";

const screens = [
    {
        title: "Discover",
        description: "Swipe through curated, verified profiles",
        accent: "Discover",
        icon: MagnifyingGlassIcon,
        content: (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="font-display text-lg font-bold text-white">Discover</div>
                    <BellIcon className="h-5 w-5 text-white/50" />
                </div>
                <div className="relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5C0F31] via-[#8B1A4A] to-[#3a0920]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.3),transparent_60%)]" />
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
                        <CheckBadgeIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span className="text-[10px] font-bold text-white">Verified</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="text-lg font-bold text-white">Ayesha, 25</div>
                        <div className="text-[11px] text-white/75">Lahore · MBBS · Sunni</div>
                    </div>
                </div>
                <div className="flex justify-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <span className="text-lg text-white/70">✕</span>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#BF953F]">
                        <HeartIcon className="h-5 w-5 text-[#1A000A]" />
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                        <SparklesIcon className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: "Chat",
        description: "Safe, moderated messaging with auto-filters",
        accent: "Chat",
        icon: ChatBubbleOvalLeftEllipsisIcon,
        content: (
            <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-white/8 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#5C0F31] to-[#8B1A4A] text-sm font-bold text-white">
                        M
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                            <div className="text-sm font-bold text-white">Mahnoor</div>
                            <CheckBadgeIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                        </div>
                        <div className="text-[10px] text-[#4ade80]">● Online</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-r from-[#D4AF37] to-[#BF953F] px-3.5 py-2 text-[12px] font-medium text-[#1A000A]">
                        Assalam o Alaikum!
                    </div>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2 text-[12px] text-white">
                        Walaikum Assalam, nice to meet you 😊
                    </div>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2 text-[12px] text-white">
                        Apka profile bhot achha laga
                    </div>
                    <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-r from-[#D4AF37] to-[#BF953F] px-3.5 py-2 text-[12px] font-medium text-[#1A000A]">
                        JazakAllah! Aap bhi bohat nice hain
                    </div>
                </div>
                <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 px-3 py-2 text-[10px] text-[#F3E5AB]">
                    🛡️ Contact info auto-blocked for your safety
                </div>
            </div>
        ),
    },
    {
        title: "Profile",
        description: "Premium verified profile with blue tick",
        accent: "Profile",
        icon: UserIcon,
        content: (
            <div className="space-y-3">
                <div className="relative h-24 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5C0F31] via-[#8B1A4A] to-[#D4AF37]/40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.4),transparent_60%)]" />
                </div>
                <div className="-mt-10 px-3">
                    <div className="relative mx-auto h-16 w-16 rounded-full border-4 border-[#0E0E11] bg-gradient-to-br from-[#8B1A4A] to-[#5C0F31] flex items-center justify-center">
                        <span className="text-lg font-bold text-white">A</span>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] ring-2 ring-[#0E0E11]">
                            <CheckBadgeIcon className="h-3.5 w-3.5 text-[#1A000A]" />
                        </span>
                    </div>
                    <div className="mt-2 text-center">
                        <div className="font-display text-base font-bold text-white">Ahmed, 28</div>
                        <div className="text-[10px] text-white/50">Islamabad · Software Engineer</div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                        <div className="text-sm font-bold text-[#D4AF37]">142</div>
                        <div className="text-[9px] text-white/50">Views</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                        <div className="text-sm font-bold text-[#D4AF37]">28</div>
                        <div className="text-[9px] text-white/50">Likes</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2 text-center">
                        <div className="text-sm font-bold text-[#D4AF37]">95%</div>
                        <div className="text-[9px] text-white/50">Complete</div>
                    </div>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#BF953F] py-1.5 text-center text-[10px] font-bold text-[#1A000A]">
                    Boost Profile
                </div>
            </div>
        ),
    },
];

export function AppShowcase() {
    return (
        <section className="section-block relative overflow-hidden">
            <div className="ambient-orb left-[10%] top-0 h-[32rem] w-[32rem] bg-[#8B1A4A]/25" />
            <div className="ambient-orb right-[5%] bottom-0 h-[24rem] w-[24rem] bg-[#D4AF37]/10" />
            <div className="site-shell relative z-10">
                <SectionHeader
                    eyebrow="App Preview"
                    title="A Premium Experience"
                    accent="in Your Pocket"
                    description="Every screen is designed around calm decision-making, respect, and privacy — not endless scrolling."
                />
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {screens.map((screen, i) => {
                        const Icon = screen.icon;
                        return (
                            <motion.div
                                key={screen.title}
                                initial={false}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.7, delay: i * 0.15 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="phone-frame w-[15.5rem] shrink-0">
                                    <div className="phone-notch" />
                                    <div className="rounded-[2rem] bg-gradient-to-b from-[#0E0E11] to-[#030304] p-3 min-h-[24rem]">
                                        {screen.content}
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2 px-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <Icon className="h-5 w-5 text-[#D4AF37]" />
                                        <h3 className="font-display text-xl font-bold text-white">
                                            {screen.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm leading-6 text-white/55">{screen.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
