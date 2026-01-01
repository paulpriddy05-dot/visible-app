import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/Logo"; // 🟢 IMPORT ADDED

export const metadata: Metadata = {
    title: "Terms of Service | Visible",
    description: "Rules for using Visible.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300 font-sans">

            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-6 max-w-4xl mx-auto">

                {/* 🟢 UPDATED: Using the official Logo component */}
                <Logo />

                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Back to Home</Link>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                <p className="text-slate-500 dark:text-zinc-400 mb-12">Last Updated: December 23, 2025</p>

                <div className="space-y-12 text-lg leading-relaxed text-slate-700 dark:text-zinc-300">

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using the Visible website and application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">2. Description of Service</h2>
                        <p>
                            Visible provides a digital workspace dashboard that integrates with third-party services like Google Drive. We do not host your files; we only display metadata and links to files you have permission to access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">3. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the security of your account and password. Visible cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">4. Google Drive Integration</h2>
                        <p>
                            Our Service integrates with Google Drive. By using this feature, you agree to comply with Google's Terms of Service. Visible is not responsible for any data loss or corruption that occurs within your Google Drive account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">5. Termination</h2>
                        <p>
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">6. Disclaimer</h2>
                        <p className="uppercase text-sm tracking-wide font-bold mb-2 text-slate-500 dark:text-zinc-500">Read carefully:</p>
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Visible expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">7. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:hello@usevisible.app" className="text-blue-600 dark:text-blue-400 hover:underline">hello@usevisible.app</a>.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}