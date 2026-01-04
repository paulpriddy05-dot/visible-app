import React from 'react';
import {
  Search,
  Bell,
  FileText,
  Users,
  FolderOpen,
  Trash2,
  Layers,
  TrendingUp
} from 'lucide-react';

export default function DemoDashboard() {
  return (
    <div className="w-full bg-slate-50 overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[600px] text-left">

      {/* --- SIDEBAR (Mock) --- */}
      <div className="w-16 md:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-10 hidden sm:flex">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <div className="flex-1 flex flex-col gap-4 w-full items-center mt-4">
          <SidebarIcon icon={<FolderOpen size={20} />} active />
          <SidebarIcon icon={<Users size={20} />} />
          <SidebarIcon icon={<Layers size={20} />} />
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F7F9]">

        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <span className="hover:text-slate-900 cursor-pointer">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">Q1 Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-400 text-sm w-48">
              <Search size={14} />
              <span>Search...</span>
            </div>
            <Bell size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-8">

          {/* SECTION: PLANNING & RESOURCES */}
          <div>
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <Layers size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Planning & Resources</h3>
              <Trash2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400" />
            </div>

            <div className="flex gap-6 overflow-visible">

              {/* THE ACTIVE DEALS CARD (Teal Gradient + Upward Graph) */}
              <div className="w-full md:w-[400px] h-[220px] rounded-2xl p-6 relative flex flex-col shadow-sm transition-transform hover:-translate-y-1 duration-300"
                style={{ background: 'linear-gradient(135deg, #2b87ab 0%, #207596 100%)' }}>

                {/* Header: Title & Stats */}
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div>
                    <h3 className="text-white/80 font-bold text-xs tracking-widest uppercase">Active Deals</h3>
                    <div className="text-5xl font-bold text-white mt-2">42</div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    <span>+12%</span>
                  </div>
                </div>

                {/* Custom SVG Chart - Up and to the Right */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradientOld" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* The Filled Area */}
                    <path
                      d="M0,100 
                         C40,90 80,80 120,60 
                         S200,40 240,30 
                         S280,10 300,5 
                         L300,150 L0,150 Z"
                      fill="url(#chartGradientOld)"
                    />

                    {/* The White Line (Stroke) - Consistent Upward Trend */}
                    <path
                      d="M0,100 
                         C40,90 80,80 120,60 
                         S200,40 240,30 
                         S280,10 300,5"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Placeholder for "Next Card" to show scrolling effect */}
              <div className="hidden md:block w-32 h-[220px] bg-[#369CA5] rounded-l-2xl opacity-80" />
            </div>
          </div>

          {/* SECTION: SAMPLE SECTION */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <Layers size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Sample Section</h3>
              <Trash2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Card 1 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Q4 Financials</h4>
                  <p className="text-xs text-slate-400">Google Sheets • Updated yesterday</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple helper for sidebar icons
function SidebarIcon({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`
            p-3 rounded-xl cursor-pointer transition-all
            ${active
        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
        `}>
      {icon}
    </div>
  )
}