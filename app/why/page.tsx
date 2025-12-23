import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why We Built Visible",
  description: "The story behind the missing home screen for Google Drive.",
};

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 1. NAVIGATION (Simple version for this page) */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-serif text-3xl font-bold text-slate-900 dark:text-zinc-100 leading-none group-hover:text-blue-600 transition-colors">V</span>
          <span className="text-lg font-bold text-slate-700 dark:text-zinc-400 tracking-tight group-hover:text-slate-900 dark:group-hover:text-zinc-200">Visible</span>
        </Link>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">Log In</Link>
          <Link href="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Get Started &rarr;</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-20 pb-32">
        
        {/* 2. THE MANIFESTO */}
        <section className="mb-24">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-900 dark:text-zinc-50 leading-[1.1] mb-8">
            See the files <br/>
            <span className="text-slate-400 dark:text-zinc-600 italic">you need.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Searching is painful. We built Visible to turn scattered Google Drive links into a coherent, customizable dashboard—so you can finally see the work that matters.
          </p>
        </section>

        {/* 3. THE PROBLEM (Agitate) */}
        <section className="mb-24 relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-zinc-800"></div>
          <div className="pl-8 md:pl-12 space-y-8">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">The Problem</h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">The "Untitled Document" Chaos</h3>
            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              Google Drive is a miracle of storage. It holds everything: your budgets, your brainstorms, your memories, and your work.
            </p>
            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              But storage is not a workspace. A storage unit is where you put things you don't need right now. A <em>workspace</em> is where you create.
            </p>
            <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
              We found ourselves spending 20 minutes just looking for "that one doc" from last week. We were drowning in tabs, lost in nested folders, and distracted by the noise of a thousand files we didn't need.
            </p>
          </div>
        </section>

        {/* 4. THE PHILOSOPHY (Core Beliefs) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-eye text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-3">Visual First</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              Humans recall images faster than filenames. We believe your work should look like a dashboard, not a spreadsheet.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-moon text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-3">Calm by Design</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              No notifications. No "suggested files." Just the things you actively chose to put on your desk today.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm md:col-span-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-layer-group text-emerald-600 dark:text-emerald-400 text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-3">Context over Content</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              A file isn't just a file. It belongs to a project, a goal, or a mission. Visible lets you bundle disparate files (Docs, Sheets, Slides) into unified "Cards" that tell a story.
            </p>
          </div>
        </section>

        {/* 5. THE SOLUTION (The Product) */}
        <section className="text-center py-16 bg-slate-100 dark:bg-zinc-900 rounded-3xl mb-24">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-zinc-100 mb-6">
            The Missing Home Screen
          </h2>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Visible is the layer that sits on top of your chaos. It doesn't replace Google Drive; it curates it. It turns your storage unit into a studio.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 rounded-xl font-bold text-lg hover:-translate-y-1 transition-transform shadow-lg hover:shadow-xl">
            <span>Build Your Dashboard</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
          <p className="mt-6 text-sm text-slate-400 dark:text-zinc-500">
            Free to start. No credit card required.
          </p>
        </section>

        {/* 6. SIGNATURE */}
        <div className="flex items-center gap-4 opacity-70">
          <div className="h-12 w-12 bg-slate-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xl font-serif font-bold text-slate-600 dark:text-zinc-400">
            V
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-zinc-200">The Visible Team</div>
            <div className="text-sm text-slate-500 dark:text-zinc-500">Crafted for focus.</div>
          </div>
        </div>

      </main>
    </div>
  );
}