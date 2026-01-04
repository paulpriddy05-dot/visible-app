"use client";

import React, { useState } from 'react';
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
  X,
  PieChart,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Map,
  Heart
} from 'lucide-react';

// --- MOCK DATA FOR THE MODAL ---
const MODAL_CONTENT = {
  strategy: {
    title: "Q4 Growth Strategy",
    color: "blue",
    sections: [
      {
        title: "Financial Planning",
        files: [
          { name: "2025 Revenue Forecast", icon: <TrendingUp size={20} className="text-blue-500" />, type: "Excel" },
          { name: "Q4 Budget Allocation", icon: <PieChart size={20} className="text-green-500" />, type: "Excel" }
        ]
      },
      {
        title: "Market Analysis",
        files: [
          { name: "Competitor Analysis Report", icon: <Globe size={20} className="text-purple-500" />, type: "PDF" },
          { name: "Customer Segmentation", icon: <Users size={20} className="text-orange-500" />, type: "Deck" }
        ]
      }
    ]
  },
  resources: {
    title: "Department Resources",
    color: "green",
    sections: [
      {
        title: "Human Resources",
        files: [
          { name: "Employee Handbook 2025", icon: <Heart size={20} className="text-rose-500" />, type: "PDF" },
          { name: "Benefits Overview", icon: <FileText size={20} className="text-blue-500" />, type: "Doc" }
        ]
      },
      {
        title: "Brand Assets",
        files: [
          { name: "Logo Pack (Vector)", icon: <FolderOpen size={20} className="text-yellow-500" />, type: "Folder" },
          { name: "Brand Guidelines v2", icon: <Map size={20} className="text-indigo-500" />, type: "PDF" }
        ]
      }
    ]
  }
};

export default function DemoDashboard() {
  const [activeModal, setActiveModal] = useState<keyof typeof MODAL_CONTENT | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white font-sans selection:bg-indigo-500/30">

      {/* --- TOP NAVIGATION --- */}
      <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-slate-400 hover:bg-[#2A2A2A] hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-900/20">
              AC
            </div>
            <span className="font-semibold tracking-tight text-lg">Acme Corp</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block w-96 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search documents, projects..."
              className="w-full bg-[#222222] border border-transparent focus:border-indigo-500/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <NavIcon icon={<Bell size={20} />} active />
            <NavIcon icon={<HelpCircle size={20} />} />
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ml-2 cursor-pointer border-2 border-[#1A1A1A] hover:border-indigo-500 transition-colors" />
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="p-8 max-w-[1600px] mx-auto space-y-10">

        {/* 1. WEEKLY OVERVIEW ROW */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Weekly Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="This Week" subtitle="Oct 24 - Oct 31" icon={<Calendar size={20} />} />
            <SummaryCard title="Next Week" subtitle="Nov 01 - Nov 07" icon={<Calendar size={20} />} delay />
            <SummaryCard title="Pending Review" subtitle="3 Documents" icon={<FileText size={20} />} delay={2} />
          </div>
        </section>

        {/* 2. KEY INITIATIVES (The Big Clickable Card) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={14} className="text-slate-500" />
            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Key Initiatives</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-64">
            {/* CLICKABLE BIG BLUE CARD */}
            <div
              onClick={() => setActiveModal('strategy')}
              className="lg:col-span-1 bg-[#0891b2] rounded-2xl p-8 relative flex flex-col justify-between shadow-2xl shadow-cyan-900/20 cursor-pointer group hover:scale-[1.01] transition-all duration-300 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-6">
                  <Globe size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Q4 Growth Strategy</h2>
                <p className="text-cyan-100 text-sm font-medium">Updated 2 hours ago</p>
              </div>

              <div className="relative z-10">
                <button className="bg-white text-[#0891b2] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-cyan-50 transition-colors flex items-center gap-2 w-fit">
                  View Dashboard
                </button>
              </div>
            </div>

            {/* Placeholder for timeline/other content */}
            <div className="lg:col-span-2 border-2 border-dashed border-[#2A2A2A] rounded-2xl flex items-center justify-center text-slate-600">
              <span className="text-sm font-medium">Timeline Visualization Placeholder</span>
            </div>
          </div>
        </section>

        {/* 3. DEPARTMENT HUBS (Clickable Green Card) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={14} className="text-slate-500" />
              <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Department Hubs</h3>
            </div>
            <Trash2 size={14} className="text-slate-600 hover:text-red-500 cursor-pointer transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setActiveModal('resources')}
              className="h-48 bg-[#059669] rounded-2xl p-6 relative overflow-hidden cursor-pointer group hover:-translate-y-1 transition-transform shadow-xl shadow-emerald-900/20"
            >
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <FolderOpen size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Department Resources</h3>
                  <p className="text-emerald-100 text-sm mt-1">12 Files • 4 Folders</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FILE ORGANIZATION MODAL --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setActiveModal(null)}
          />

          <div className="bg-[#1A1A1A] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-[#333333]">

            {/* Modal Header */}
            <div className="h-20 bg-[#222222] border-b border-[#333333] flex items-center justify-between px-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{MODAL_CONTENT[activeModal].title}</h2>
                <div className="flex gap-2 text-xs text-slate-400 mt-1">
                  <span>Last edited today at 10:42 AM</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ActionButton icon={<PieChart size={16} />} label="Visualize Data" primary />
                <ActionButton icon={<ExternalLink size={16} />} label="Open in Docs" />
                <ActionButton icon={<Edit size={16} />} label="Edit Card" />
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-colors ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 bg-[#F5F5F5] min-h-[500px] max-h-[80vh] overflow-y-auto">

              {MODAL_CONTENT[activeModal].sections.map((section, idx) => (
                <div key={idx} className="mb-10 last:mb-0">
                  <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4 pl-1">
                    {section.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.files.map((file, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                          {file.icon}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-800 text-sm">{file.name}</h5>
                          <span className="text-xs text-slate-400 font-medium">{file.type} • 2.4 MB</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={16} className="text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add New Section Placeholder */}
              <div className="mt-8 border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center text-slate-400 text-sm font-bold cursor-pointer hover:bg-slate-200/50 transition-colors">
                + Add New Section
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- HELPER COMPONENTS ---

function NavIcon({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={`
      p-2 rounded-lg transition-colors relative
      ${active ? 'text-white bg-[#2A2A2A]' : 'text-slate-400 hover:text-white hover:bg-[#2A2A2A]'}
    `}>
      {icon}
      {active && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#2A2A2A]" />}
    </button>
  );
}

function SummaryCard({ title, subtitle, icon, delay = 0 }: any) {
  return (
    <div className={`bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-xl flex items-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer group`}>
      <div className="w-12 h-12 rounded-full bg-[#222222] flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-bold text-lg">{title}</h4>
        <p className="text-slate-500 text-xs font-medium">{subtitle}</p>
      </div>
    </div>
  )
}

function ActionButton({ icon, label, primary }: any) {
  return (
    <button className={`
      flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
      ${primary
        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50'
        : 'bg-[#2A2A2A] text-slate-300 hover:bg-[#333333] hover:text-white'}
    `}>
      {icon}
      {label}
    </button>
  )
}