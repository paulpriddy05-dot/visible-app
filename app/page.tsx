import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="text-xl font-bold text-slate-800">Visible</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-5 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/login" // Or /signup if you separate them later
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Visualize Your <span className="text-blue-600">Ministry Data</span>.
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Transform spreadsheets and scattered metrics into clear, actionable dashboards. 
          See the health of your organization at a glance.
        </p>
        
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Launch Dashboard
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl text-lg border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Optional: Dashboard Preview Image */}
        <div className="mt-16 w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 overflow-hidden">
           <div className="bg-slate-100 rounded-xl h-64 md:h-96 flex items-center justify-center text-slate-400">
             {/* Replace this with an actual screenshot later */}
             <span className="font-medium">Dashboard Preview Image</span>
           </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Visible App. All rights reserved.
      </footer>
    </div>
  );
}