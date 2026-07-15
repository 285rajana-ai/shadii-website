"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminLoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Clear any existing session to start fresh
        localStorage.removeItem("shadii_token");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("https://shadi-production.up.railway.app/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "Invalid login credentials.");
                setLoading(false);
                return;
            }

            const user = data.user;
            const token = data.token;

            // Strict check: Only allow admin, superadmin, cacc, fasm
            const isAdminRole = user.isAdmin || ["superadmin", "cacc", "fasm", "admin"].includes(user.role);
            if (!isAdminRole) {
                setError("Access Denied: Unrecognized administrator credentials.");
                setLoading(false);
                return;
            }

            // Sync with portal's local storage session
            localStorage.setItem("shadii_token", token);

            // Redirect directly to portal admin console
            window.location.href = "/portal/admin";
        } catch (err) {
            setError("Connection failure to authorization servers. Please try again.");
            setLoading(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0D0811] relative overflow-hidden px-4">
            {/* Ambient luxury light beams */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#8B1A4A]/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#C5A059]/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Brand Logo Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-3">
                        <span className="text-3xl">💍</span>
                        <span className="font-serif text-2xl font-bold tracking-wider text-white">
                            Shadii<span className="text-[#C5A059]">.pk</span>
                        </span>
                    </Link>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold">
                        Administrator Portal
                    </p>
                </div>

                {/* Glassmorphic Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-[#C5A059]/30 rounded-tr-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 border-l border-b border-[#C5A059]/30 rounded-bl-3xl pointer-events-none" />

                    <h2 className="text-xl font-bold text-white mb-6 text-center tracking-wide">
                        Secure Authentication
                    </h2>

                    {error && (
                        <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs leading-5">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-white/50 font-bold mb-2">
                                Administrative Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                                placeholder="name@shadii.pk"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-white/50 font-bold mb-2">
                                Security Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden group flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide bg-gradient-to-r from-[#BF953F] to-[#D4AF37] hover:from-[#d4af37] hover:to-[#f3e5ab] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-8"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Authorizing...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to main site link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-xs text-white/40 hover:text-[#C5A059] transition-colors uppercase tracking-widest font-bold"
                    >
                        ← Back to Main Website
                    </Link>
                </div>
            </div>
        </main>
    );
}
