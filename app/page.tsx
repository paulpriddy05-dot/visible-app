import Link from 'next/link';
import DemoDashboard from "@/components/DemoDashboard";
import Logo from "@/components/Logo";
import { Metadata } from 'next';
import { LayoutGrid, Wand2, LineChart, Check } from 'lucide-react';

export const metadata: Metadata = {
    title: "Visible | The Missing Home Screen for Drive",
    description: "Organize your Google Drive into a visual dashboard.",
};

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-sans selection:bg-indigo-100">

            {/* --- NAVIGATION --- */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="select-none">
                        <Logo className="h-10" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/why" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
                            Our Story
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/login" className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm sm:text-base hidden sm:block">
                            Sign In
                        </Link>
                        <Link href="/login" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="flex-1 flex flex-col items-center pt-28 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 text-center max-w-7xl mx-auto w-full relative">

                {/* Subtle Background Grid */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white [background-image:linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] [background-size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 sm:mb-8 tracking-tight leading-tight max-w-5xl">
                    The home screen your <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Google Drive is missing.</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-500 max-w-2xl sm:max-w-3xl mb-8 sm:mb-12 leading-relaxed px-2">
                    Stop digging through endless folders. Visible lets you curate
                    your Docs, Sheets, and Slides into <strong>visual cards</strong>—giving you a dashboard that actually makes sense.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20 sm:mb-24">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl shadow-indigo-200 hover:-translate-y-1"
                    >
                        Organize My Workspace
                    </Link>
                    <a
                        href="#features"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-xl text-lg border border-slate-200 hover:bg-slate-50 transition-all"
                    >
                        How it works
                    </a>
                </div>

                {/* --- INTERACTIVE APP PREVIEW --- */}
                <div className="relative w-full max-w-6xl mx-auto mb-20 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative shadow-2xl rounded-[1.5rem] bg-white border border-slate-200/50 overflow-hidden">
                        <DemoDashboard />
                    </div>
                </div>

                {/* --- FEATURES GRID --- */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-left w-full border-t border-slate-200 pt-16 sm:pt-24 pb-12">
                    <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Curated Cards</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Folders hide your work. Visible lets you pin Docs, Slides, and PDFs to visual cards so your team can find exactly what they need.
                        </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                        <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-2 group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-300">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Tailored to You</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Drag, drop, and resize. Build a dashboard that fits your specific workflow—whether you're managing a creative project or a budget.
                        </p>
                    </div>
                    <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                        <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300">
                            <LineChart className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Live Data Sync</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Need numbers? Connect a Google Sheet and watch it transform into a live metric on your dashboard. No more static screenshots.
                        </p>
                    </div>
                </div>
            </main>

            {/* --- PRICING SECTION (Added) --- */}
            <section id="pricing" className="py-20 sm:py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">

                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
                        Start organizing your workspace for free. Upgrade for power features and team collaboration.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                        {/* PLAN 1: STARTER */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="mb-4">
                                <span className="text-slate-500 font-medium">Starter</span>
                                <div className="text-4xl font-bold text-slate-900 mt-2">$0</div>
                                <div className="text-slate-400 text-sm mt-1">Forever free</div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                <PricingCheck text="1 Dashboard" />
                                <PricingCheck text="Up to 10 pinned files" />
                                <PricingCheck text="Basic layouts" />
                            </ul>
                            <Link href="/login" className="w-full block py-3 px-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                Start for Free
                            </Link>
                        </div>

                        {/* PLAN 2: PRO (With Lemon Squeezy Link) */}
                        <div className="bg-white rounded-2xl p-8 border-2 border-indigo-600 shadow-xl relative flex flex-col scale-105 z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Most Popular
                            </div>
                            <div className="mb-4">
                                <span className="text-indigo-600 font-bold">Pro</span>
                                <div className="text-4xl font-bold text-slate-900 mt-2">$5</div>
                                <div className="text-slate-400 text-sm mt-1">per month</div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                <PricingCheck text="Unlimited Dashboards" highlight />
                                <PricingCheck text="Unlimited pinned files" highlight />
                                <PricingCheck text="Unlimited visualization" highlight />
                                <PricingCheck text="Unlimited dashboard members" highlight />
                            </ul>
                            {/* LEMON SQUEEZY LINK HERE */}
                            <a
                                href="https://yourstore.lemonsqueezy.com/checkout/buy/xxxx"
                                className="w-full block py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                Get Pro
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-slate-200 bg-slate-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <Logo className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                        <span className="text-xs text-slate-400">© 2025 Visible. All rights reserved.</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                        <a href="mailto:hello@usevisible.app" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Pricing Helper Component
function PricingCheck({ text, highlight = false }: { text: string; highlight?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                <Check size={12} strokeWidth={3} />
            </div>
            <span className={`text-sm ${highlight ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {text}
            </span>
        </li>
    );
}