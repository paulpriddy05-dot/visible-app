"use client";

import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">

                {/* Header */}
                <div className="mb-16">
                    <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 mb-4 inline-block text-sm font-bold">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Choose the plan that fits your needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                    {/* STARTER */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                        <h3 className="text-slate-500 font-bold text-lg mb-2">Starter</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1">$0</div>
                        <div className="text-slate-400 text-sm mb-6">Forever free</div>

                        <ul className="space-y-4 text-left text-sm text-slate-600 mb-8 flex-1">
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> 1 Dashboard</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> Up to 10 pinned files</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> One data visualization</li>
                        </ul>

                        <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                            Current Plan
                        </button>
                    </div>

                    {/* PRO (Highlighted) */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-600 relative flex flex-col transform scale-105 z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Most Popular
                        </div>
                        <h3 className="text-blue-600 font-bold text-lg mb-2">Pro</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1">$2</div>
                        <div className="text-slate-400 text-sm mb-6">per month</div>

                        <ul className="space-y-4 text-left text-sm text-slate-600 mb-8 flex-1">
                            <li className="flex items-center gap-3"><i className="fas fa-check-circle text-blue-600"></i> Unlimited Dashboards</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check-circle text-blue-600"></i> Unlimited pinned files</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check-circle text-blue-600"></i> Unlimited visualization</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check-circle text-blue-600"></i> Up to 5 team members</li>
                        </ul>

                        <Link href="https://usevisible.lemonsqueezy.com/checkout/buy/5ee7a79c-76fc-45ab-b5ff-a8c989b7e903" /* https://usevisible.lemonsqueezy.com/checkout/buy/5ee7a79c-76fc-45ab-b5ff-a8c989b7e903 */ >
                            <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/25">
                                Get Pro
                            </button>
                        </Link>
                    </div>

                    {/* TEAM */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                        <h3 className="text-slate-900 font-bold text-lg mb-2">Team</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1">$5</div>
                        <div className="text-slate-400 text-sm mb-6">per member / month</div>

                        <ul className="space-y-4 text-left text-sm text-slate-600 mb-8 flex-1">
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> Unlimited Everything</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> Priority Support</li>
                            <li className="flex items-center gap-3"><i className="fas fa-check text-blue-500 bg-blue-50 p-1 rounded-full text-xs"></i> Advanced Permissions</li>
                        </ul>
                        <Link href="https://usevisible.lemonsqueezy.com/checkout/buy/93649dd7-2dc9-40b8-bd62-a033cc9d5112" /* https://usevisible.lemonsqueezy.com/checkout/buy/93649dd7-2dc9-40b8-bd62-a033cc9d5112 */ >
                            <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/25">
                                Get Pro
                            </button>
                        </Link>

                        <button className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-600 hover:text-blue-600 transition-all">
                            Get Visible Team
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}