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
    <div className="w-full bg-slate-50 overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[600px] text-left border border-slate-200 rounded-2xl shadow-2xl">

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
        <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300" />
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F7F9]">

        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <span className="hover:text-slate-900 cursor-pointer">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">Q4 Performance</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-400 text-sm w-48 border border-slate-200">
              <Search size={14} />
              <span>Search...</span>
            </div>
            <Bell size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-8">

          {/* SECTION: KEY METRICS */}
          <div>
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <Layers size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Key Metrics</h3>
            </div>

            <div className="flex gap-6 overflow-visible">
              {/* NEW DATA CARD (Up and to the Right) */}
              <div className="w-full md:w-[420px] h-[240px] rounded-2xl p-6 relative flex flex-col shadow-sm bg-white border border-slate-200">

                {/* Header: Title & Badge */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-slate-500 font-bold text-xs tracking-widest uppercase">Active Deals</h3>
                    <div className="text-5xl font-black text-slate-900 mt-2">42</div>
                  </div>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    <TrendingUp size={14} />
                    <span>+12% vs last week</span>
                  </div>
                </div>

                {/* Custom SVG Chart - Up and to the Right */}
                <div className="flex-1 w-full relative mt-4">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradientNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* The Filled Area */}
                    <path
                      d="M0,80 C50,70 100,60 150,40 S250,20 300,5 L300,100 L0,100 Z"
                      fill="url(#chartGradientNew)"
                    />

                    {/* The Line (Stroke) */}
                    <path
                      d="M0,80 C50,70 100,60 150,40 S250,20 300,5"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Placeholder for "Next Card" */}
              <div className="hidden md:block w-32 h-[240px] bg-slate-100 border border-slate-200 rounded-l-2xl opacity-60" />
            </div>
          </div>

          {/* SECTION: PIPELINE */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <Layers size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Pipeline Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proposal Stage Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 text-sm">Proposal Stage</h4>
                  <span className="text-slate-900 font-bold">18</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full" />
                </div>
              </div>

              {/* Negotiation Stage Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 text-sm">Negotiation</h4>
                  <span className="text-slate-900 font-bold">12</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[40%] rounded-full" />
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