import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/Logo"; // 🟢 IMPORT ADDED

export const metadata: Metadata = {
    title: "Privacy Policy | Visible",
    description: "How we handle your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300 font-sans">

            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-6 max-w-4xl mx-auto">

                {/* 🟢 UPDATED: Using the official Logo component */}
                <Logo />

                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Back to Home</Link>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-slate-500 dark:text-zinc-400 mb-12">Last Updated: December 23, 2025</p>

                <div className="space-y-12 text-lg leading-relaxed text-slate-700 dark:text-zinc-300">

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">1. Introduction</h2>
                        <p>
                            Visible ("we", "our", or "us") operates the website https://usevisible.app (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">2. Data We Collect</h2>
                        <p className="mb-4">We collect several different types of information for various purposes to provide and improve our Service to you:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Data:</strong> When you sign up, we collect your email address and name via our authentication provider (Supabase).</li>
                            <li><strong>Google Drive Data:</strong> To provide our core functionality, we request access to your Google Drive metadata (file names, IDs, types, and organization).</li>
                        </ul>
                    </section>

                    <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">3. Google User Data (Limited Use Policy)</h2>
                        <p className="mb-4">
                            Visible's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                        </p>
                        <p>Specifically:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>We only access Google Drive files that you explicitly select or organize within our dashboard.</li>
                            <li>We do <strong>not</strong> use your Google Workspace data for advertisements.</li>
                            <li>We do <strong>not</strong> allow humans to read your data unless we have your affirmative agreement for specific messages, doing so is necessary for security purposes, or to comply with applicable law.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">4. How We Use Your Data</h2>
                        <p>We use the collected data for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>To provide and maintain the Service (e.g., displaying your files in a dashboard layout).</li>
                            <li>To notify you about changes to our Service.</li>
                            <li>To allow you to participate in interactive features when you choose to do so.</li>
                            <li>To provide customer support.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">5. Data Retention</h2>
                        <p>
                            We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. You can request the deletion of your account and all associated data at any time by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:<br />
                            <a href="mailto:hello@usevisible.app" className="text-blue-600 dark:text-blue-400 hover:underline">hello@usevisible.app</a>
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}