import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg">
              V
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Visible</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-slate-500 font-medium hover:text-slate-900 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="flex-1 flex flex-col items-center pt-40 pb-20 px-6 text-center max-w-7xl mx-auto">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-widest border border-blue-100">
          Now in Public Beta
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight max-w-4xl">
          Turn your spreadsheets into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">beautiful dashboards.</span>
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
          Stop sending screenshots of Excel. Visible connects to your existing Google Sheets and Drive files to build live, shareable command centers in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl shadow-blue-200 hover:-translate-y-1"
          >
            Start Visualizing for Free
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl text-lg border border-slate-200 hover:bg-slate-50 transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* --- APP PREVIEW MOCKUP --- */}
        <div className="relative w-full max-w-6xl rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10 mb-24 overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
             {/* Mockup Placeholder - Replace with screenshot later */}
             <div className="text-center p-12">
                <div className="grid grid-cols-3 gap-6 opacity-50 scale-90 blur-[1px] group-hover:blur-0 group-hover:scale-100 transition-all duration-700">
                    <div className="h-40 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-40 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-40 bg-white rounded-xl shadow-sm"></div>
                    <div className="col-span-2 h-48 bg-white rounded-xl shadow-sm"></div>
                    <div className="h-48 bg-white rounded-xl shadow-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-slate-900/80 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm">Dashboard Preview</span>
                </div>
             </div>
           </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left w-full border-t border-slate-200 pt-24">
            
            {/* Feature 1 */}
            <div className="space-y-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-2xl mb-2">
                    <i className="fas fa-table"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sync with Google Sheets</h3>
                <p className="text-slate-500 leading-relaxed">
                    Don't change how you work. Update your spreadsheet, and your Visible dashboard updates instantly. No complex migrations required.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-2xl mb-2">
                    <i className="fas fa-folder-open"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Centralize Resources</h3>
                <p className="text-slate-500 leading-relaxed">
                    Stop digging through Drive. Pin important Docs, PDFs, and Slides directly to your dashboard for one-click access.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-2xl mb-2">
                    <i className="fas fa-layer-group"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Drag & Drop Organization</h3>
                <p className="text-slate-500 leading-relaxed">
                    Create manual cards for quick announcements, organize workflows, and customize your layout to fit your team's needs.
                </p>
            </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="h-6 w-6 bg-slate-400 rounded-md flex items-center justify-center text-white font-bold text-xs">V</div>
                <span className="font-bold text-slate-600">Visible</span>
            </div>
            <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Visible App. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}