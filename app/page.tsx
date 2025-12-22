import Link from 'next/link';
import DemoDashboard from "@/components/DemoDashboard";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden font-sans">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* 🟢 NEW LOGO: Matches your image (Serif V + Sans Text) */}
          <div className="flex items-baseline gap-1 select-none cursor-default">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-none">
              V
            </span>
            <span className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
              Visible
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              href="/login" 
              className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm sm:text-base hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="flex-1 flex flex-col items-center pt-28 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 text-center max-w-7xl mx-auto w-full">
        
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] sm:text-xs uppercase tracking-widest border border-indigo-100">
          v2.0 Now Available
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 sm:mb-8 tracking-tight leading-tight max-w-5xl">
          The home screen your <br className="hidden md:block"/>
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
        <div className="relative w-full max-w-6xl mx-auto mb-20">
           {/* Glow Effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-[2rem] blur-xl opacity-20"></div>
           
           {/* The Demo Component */}
           <div className="relative shadow-2xl rounded-[1.5rem] bg-white border border-slate-200/50">
              <DemoDashboard />
           </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-left w-full border-t border-slate-200 pt-16 sm:pt-24 pb-12">
            
            {/* Feature 1 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xl mb-2 group-hover:scale-110 transition-transform">
                    <i className="fas fa-th-large"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Curated Cards, Not Folders</h3>
                <p className="text-slate-500 leading-relaxed">
                    Folders hide your work. Visible lets you pin Docs, Slides, and PDFs to visual cards so your team can find exactly what they need in seconds.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-xl mb-2 group-hover:scale-110 transition-transform">
                    <i className="fas fa-magic"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tailored to You</h3>
                <p className="text-slate-500 leading-relaxed">
                    Drag, drop, and resize. Build a dashboard that fits your specific workflow—whether you're managing a creative project, a budget, or a team roster.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 group">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform">
                    <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Live Data Sync</h3>
                <p className="text-slate-500 leading-relaxed">
                    Need numbers? Connect a Google Sheet and watch it transform into a live metric on your dashboard. No more static screenshots.
                </p>
            </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            
            {/* 🟢 NEW LOGO IN FOOTER */}
            <div className="flex items-baseline gap-1 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                <span className="font-serif text-2xl font-bold text-slate-900 leading-none">V</span>
                <span className="text-lg font-bold text-slate-600 tracking-tight">Visible</span>
            </div>

            <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Visible App. Built for modern teams.
            </p>
        </div>
      </footer>
    </div>
  );
}