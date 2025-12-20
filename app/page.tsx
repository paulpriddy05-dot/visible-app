import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-indigo-200 shadow-lg">
              V
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Visible</span>
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
          Public Beta
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 sm:mb-8 tracking-tight leading-tight max-w-5xl">
          The home screen your <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Google Drive is missing.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl sm:max-w-3xl mb-8 sm:mb-12 leading-relaxed px-2">
          Stop digging through endless folders. Visible lets you curate 
          your Docs, Sheets, and Slides into <strong>visual cards</strong>—giving you a dashboard that actually makes sense.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16 sm:mb-20">
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
            See an Example
          </a>
        </div>

        {/* --- APP PREVIEW (Abstract) --- */}
        <div className="relative w-full max-w-6xl rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10 mb-16 sm:mb-24 overflow-hidden group">
           <div className="bg-slate-50 rounded-xl min-h-[300px] sm:aspect-video flex items-center justify-center relative overflow-hidden">
             
             {/* Abstract Representation of "Cards" vs "Files" */}
             <div className="flex flex-col items-center gap-6 sm:gap-8 p-6 sm:p-12 w-full h-full justify-center">
                
                {/* Visual Cards Row - Stacks on Mobile, Row on Desktop */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full md:w-auto items-center">
                    {/* Card 1 */}
                    <div className="w-full max-w-[280px] md:w-64 h-32 md:h-40 bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-5 flex flex-col justify-between hover:scale-105 transition-transform duration-500">
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600"><i className="fas fa-file-word"></i></div>
                            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600"><i className="fas fa-file-excel"></i></div>
                        </div>
                        <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                    
                    {/* Card 2 */}
                    <div className="w-full max-w-[280px] md:w-64 h-32 md:h-40 bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-5 flex flex-col justify-between hover:scale-105 transition-transform duration-500 delay-100">
                        <div className="w-8 h-8 rounded bg-yellow-100 flex items-center justify-center text-yellow-600"><i className="fas fa-file-powerpoint"></i></div>
                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                        <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                    </div>

                    {/* Card 3 (Hidden on very small screens to save space, visible on tablet+) */}
                    <div className="hidden sm:flex w-full max-w-[280px] md:w-64 h-32 md:h-40 bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-5 flex-col justify-between hover:scale-105 transition-transform duration-500 delay-200">
                        <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600"><i className="fas fa-file-pdf"></i></div>
                        <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                    </div>
                </div>
                
                <p className="text-slate-400 font-medium mt-2 sm:mt-4 text-sm sm:text-base px-4">
                  Curate scattered files into clean, visual Project Cards.
                </p>
             </div>

           </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-left w-full border-t border-slate-200 pt-16 sm:pt-24 pb-12">
            
            {/* Feature 1 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xl sm:text-2xl mb-2">
                    <i className="fas fa-th-large"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Curated Cards, Not Folders</h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Folders hide your work. Visible lets you pin Docs, Slides, and PDFs to visual cards so your team can find exactly what they need in seconds.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 text-xl sm:text-2xl mb-2">
                    <i className="fas fa-magic"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Tailored to You</h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Drag, drop, and resize. Build a dashboard that fits your specific workflow—whether you're managing a creative project, a budget, or a team roster.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 sm:space-y-4 px-4 sm:px-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl sm:text-2xl mb-2">
                    <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Live Data Sync</h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Need numbers? Connect a Google Sheet and watch it transform into a live metric on your dashboard. No more static screenshots.
                </p>
            </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 sm:py-12 text-center">
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