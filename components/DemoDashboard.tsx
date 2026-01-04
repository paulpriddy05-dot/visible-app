import React from 'react';
import {
  Search,
  Bell,
  FileText,
  Users,
  FolderOpen,
  Calendar,
  TrendingUp,
  Briefcase,
  Globe,
  LogOut,
  ChevronLeft,
  Settings,
  HelpCircle,
  BarChart,
  PieChart
} from 'lucide-react';

export default function DemoDashboard() {
  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="h-16 bg-[#222222] border-b border-[#333333] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-slate-400 hover:bg-[#333333] hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
              AC
            </div>
            <span className="font-semibold tracking-tight text-lg">Acme Corp</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents, projects..."
              className="w-full bg-[#333333] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-[#333333] hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:bg-[#333333] hover:text-white hidden sm:block">
              <HelpCircle size={20} />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:bg-[#333333] hover:text-white hidden sm:block">
              <Settings size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-[#444444] overflow-hidden">
              {/* User Avatar Placeholder */}
            </div>
            <button className="bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Section 1: Key Metrics & Performance */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Key Metrics & Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1: Revenue Targets (Green Gradient) */}
            <div className="h-[220px] rounded-2xl p-6 relative flex flex-col shadow-lg transition-transform hover:-translate-y-1 duration-300 overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Globe size={24} className="text-white" />
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>On Track</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <h3 className="text-white font-bold text-xl mb-4">Q4 Revenue Targets</h3>
                <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors tracking-wider uppercase">
                  View Report
                </button>
              </div>
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            </div>

            {/* Card 2: Active Deals (White Card with Chart) */}
            <div className="h-[220px] bg-[#222222] rounded-2xl p-6 shadow-lg flex flex-col border border-[#333333]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase">Active Deals</h3>
                  <div className="text-5xl font-bold text-white mt-2">42</div>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>+12% vs last week</span>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Proposal Stage</span>
                    <span className="font-bold text-white">18</span>
                  </div>
                  <div className="h-2 w-full bg-[#333333] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Negotiation</span>
                    <span className="font-bold text-white">12</span>
                  </div>
                  <div className="h-2 w-full bg-[#333333] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[40%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Team Productivity (Dark Card with Icon) */}
            <div className="h-[220px] bg-[#222222] rounded-2xl p-6 shadow-lg flex flex-col border border-[#333333] relative overflow-hidden">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-3 bg-[#333333] rounded-full">
                  <Users size={24} className="text-indigo-400" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <h3 className="text-white font-bold text-xl mb-4">Team Productivity</h3>
                <button className="bg-[#333333] hover:bg-[#444444] text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors tracking-wider uppercase">
                  View Dashboard
                </button>
              </div>
              {/* Background Pattern */}
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            </div>

          </div>
        </div>

        {/* Section 2: Resources & Files */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Resources & Files</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* File Card 1 */}
            <div className="bg-[#222222] p-4 rounded-xl border border-[#333333] shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition-colors">
              <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Q4 Financials.xlsx</h4>
                <p className="text-xs text-slate-400 mt-1">Updated yesterday by Jane D.</p>
              </div>
            </div>

            {/* File Card 2 */}
            <div className="bg-[#222222] p-4 rounded-xl border border-[#333333] shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition-colors">
              <div className="h-12 w-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Client Contracts - Nov</h4>
                <p className="text-xs text-slate-400 mt-1">Google Drive Folder • 12 items</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}