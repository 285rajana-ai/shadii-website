"use client";

import { heroMatches } from "@/lib/site-data";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  HeartIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const container = {
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;

const item = {
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

export function Hero() {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:5173";

  return (
    <section className="relative overflow-hidden pt-40 sm:pt-44 lg:pt-48">
      {/* Ambient background */}
      <div className="ambient-orb left-[-10rem] top-24 h-[36rem] w-[36rem] bg-[#5C0F31]/55 animate-orb" />
      <div className="ambient-orb right-[-12rem] top-0 h-[38rem] w-[38rem] bg-[#D4AF37]/18 animate-orb" />
      <div className="ambient-orb bottom-[-4rem] left-[30%] h-[28rem] w-[28rem] bg-[#8B1A4A]/35" />
      <div className="grid-pattern" />

      <div className="site-shell pb-16 sm:pb-20 lg:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] xl:gap-20">
          {/* Left column: content */}
          <motion.div
            variants={container}
            initial={false}
            animate="show"
            className="relative z-10 space-y-8"
          >
            <motion.div variants={item} className="hidden w-fit max-w-full items-center gap-2.5 rounded-full border border-[#D4AF37]/25 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 px-4 py-2 text-sm font-semibold text-[#F3E5AB] shadow-[0_8px_24px_rgba(212,175,55,0.08)] sm:inline-flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
              </span>
              Pakistan&apos;s Most Trusted Matrimonial Platform
            </motion.div>

            <motion.div variants={item} className="space-y-6">
              <h1 className="font-display max-w-4xl text-[clamp(3rem,10vw,5.15rem)] font-bold leading-[0.99] tracking-[-0.035em] text-white">
                Find Your{" "}
                <span className="gradient-text italic">Perfect Match</span>
                <br />
                with calm, private confidence.
              </h1>
              <p className="max-w-2xl text-base leading-[1.85] text-white/65 sm:text-lg lg:text-xl">
                Shadii.pk is built for serious Pakistani families — verified profiles, intelligent
                daily matches, safe messaging, and privacy controls that respect both tradition and
                modern expectations.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a href={`${portalUrl}/register?plan=free`} className="button-primary w-full px-7 py-4 text-base sm:w-auto">
                Create Free Account
                <ArrowRightIcon className="h-5 w-5" />
              </a>
              <a href={`${portalUrl}/login`} className="button-secondary w-full px-7 py-4 text-base sm:w-auto">
                <PlayCircleIcon className="h-5 w-5 text-[#D4AF37]" />
                Login to Portal
              </a>
            </motion.div>

            {/* Trust badges row */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm text-white/55"
            >
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-[#D4AF37]" />
                CNIC Verified
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-[#D4AF37]" />
                100% Private
              </div>
              <div className="flex items-center gap-2">
                <HeartIcon className="h-5 w-5 text-[#D4AF37]" />
                Family Friendly
              </div>
            </motion.div>
          </motion.div>

          {/* Right column: phone mockup */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto flex w-full max-w-[36rem] justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[34rem]">
              {/* Glow behind phone */}
              <div className="absolute inset-x-12 top-16 h-56 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#8B1A4A]/30 blur-[100px]" />

              {/* Floating card: Private */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute left-0 top-16 z-20 hidden premium-panel animate-float p-4 pr-5 sm:-left-10 sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="icon-tile h-11 w-11 rounded-xl">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                      Private by default
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-white">
                      Blur + safe chat
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card: Verified */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute bottom-20 right-0 z-20 hidden premium-panel animate-float-delayed p-4 pr-5 sm:-right-10 sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="icon-tile h-11 w-11 rounded-xl">
                    <CheckBadgeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                      Verified profiles
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-white">
                      CNIC + live selfie
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Phone frame */}
              <div className="phone-frame mx-auto w-[18.5rem] sm:w-[21rem]">
                <div className="phone-notch" />
                <div className="space-y-4 rounded-[2.25rem] bg-gradient-to-b from-[#0E0E11] to-[#030304] p-4">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-white/50">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>●●●●</span>
                      <span>●●</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/12 via-[#8B1A4A]/14 to-transparent p-4 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
                      Today&apos;s AI Matches
                    </div>
                    <div className="mt-1.5 font-display text-3xl font-bold text-white">
                      5 <span className="gradient-text italic">New</span>
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">
                      Handpicked based on your preferences
                    </div>
                  </div>

                  {/* Match cards */}
                  <div className="space-y-2.5">
                    {heroMatches.map((profile, idx) => (
                      <motion.div
                        key={profile.name}
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + idx * 0.12, duration: 0.5 }}
                        className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3 backdrop-blur-sm"
                      >
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5C0F31] to-[#8B1A4A] text-sm font-bold text-white">
                          {profile.name[0]}
                          {profile.verified && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] ring-2 ring-[#0E0E11]">
                              <CheckBadgeIcon className="h-3 w-3 text-[#1A000A]" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold text-white">
                            {profile.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-white/50">
                            {profile.age} · {profile.city}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/12 px-2.5 py-1 text-[11px] font-bold text-[#F3E5AB]">
                          {profile.match}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom CTA */}
                  <div className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#BF953F] py-2.5 text-center text-[12px] font-bold text-[#1A000A]">
                    <SparklesIcon className="mr-1 inline h-3.5 w-3.5" />
                    See all matches
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
