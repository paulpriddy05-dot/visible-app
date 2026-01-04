"use client";

import React, { useState } from 'react';
import {
  Search,
  Bell,
  FileText,
  Users,
  FolderOpen,
  Trash2,
  Layers,
  TrendingUp,
  X,
  ExternalLink,
  Download
} from 'lucide-react';

// --- MOCK DATA FOR MODALS ---
const METRICS_DATA = {
  id: "metrics",
  title: "Active Deals",
  type: "metrics",
  color: "teal",
  primary: "42",
  sub: "+12% vs last week",
  breakdown: [
    { label: "Proposal Stage", val: "18" },
    { label: "Negotiation", val: "12" },
    { label: "Closed Won", val: "8" },
    { label: "On Hold", val: "4" }
  ]
};

const FILE_DATA = {
  id: "file1",
  title: "Q4 Financials",
  type: "file",
  color: "blue",
  meta: "Google Sheets • Updated yesterday",
  size: "2.4 MB"
};

export default function DemoDashboard() {
  const [activeCard, setActiveCard] = useState<any>(null);

  return (
    <div className="w-full bg-slate-50 overflow-hidden flex flex-col md:flex-row h-[500px] md:h-[600px] text-left relative font-sans">

      {/* --- SIDEBAR (Static) --- */}
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
            </div>

            <div className="flex gap-6 overflow-visible">

              {/* THE ACTIVE DEALS CARD (Clickable) */}
              <div
                onClick={() => setActiveCard(METRICS_DATA)}
                className="w-full md:w-[400px] h-[220px] rounded-2xl p-6 relative flex flex-col shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer duration-300"
                style={{ background: 'linear-gradient(135deg, #2b87ab 0%, #207596 100%)' }}
              >
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
                    <path
                      d="M0,100 C40,90 80,80 120,60 S200,40 240,30 S280,10 300,5 L300,150 L0,150 Z"
                      fill="url(#chartGradientOld)"
                    />
                    <path
                      d="M0,100 C40,90 80,80 120,60 S200,40 240,30 S280,10 300,5"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Placeholder for "Next Card" */}
              <div className="hidden md:block w-32 h-[220px] bg-[#369CA5] rounded-l-2xl opacity-80" />
            </div>
          </div>

          {/* SECTION: SAMPLE SECTION */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <Layers size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Sample Section</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Card 1 (Clickable) */}
              <div
                onClick={() => setActiveCard(FILE_DATA)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors"
              >
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

      {/* --- MODAL OVERLAY (Restored Functionality) --- */}
      {activeCard && (
        <div
          onClick={() => setActiveCard(null)}
          className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className={`p-6 flex justify-between items-center text-white`}
              style={{ background: activeCard.color === 'teal' ? 'linear-gradient(135deg, #2b87ab 0%, #207596 100%)' : '#3b82f6' }}>
              <div>
                <h3 className="text-xl font-bold">{activeCard.title}</h3>
                {activeCard.type === 'file' && <div className="text-xs opacity-80">{activeCard.meta}</div>}
              </div>
              <button onClick={() => setActiveCard(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-slate-50">
              {activeCard.type === "metrics" ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Current Count</div>
                      <div className="text-4xl font-bold text-slate-800">{activeCard.primary}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                        <TrendingUp size={14} />
                        {activeCard.sub}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {activeCard.breakdown.map((b: any) => (
                      <div key={b.label} className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{b.label}</div>
                        <div className="text-lg font-bold text-slate-700">{b.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm">Preview File</div>
                        <div className="text-xs text-slate-400">{activeCard.size}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors">
                      <Download size={14} /> Download
                    </button>
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                      <ExternalLink size={14} /> Open
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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