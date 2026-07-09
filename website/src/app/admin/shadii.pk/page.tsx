"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                                required
                            />
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
