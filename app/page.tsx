import React from 'react';
import {
    Search,
    Bell,
    MoreHorizontal,
    FileText,
    PieChart,
    Users,
    FolderOpen,
    ArrowUpRight,
    Presentation
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
                    <SidebarIcon icon={<PieChart size={20} />} />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-200" />
            </div>

            {/* --- MAIN AREA --- */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header */}
                <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <span className="hover:text-slate-900 cursor-pointer">Workspace</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">Q1 Marketing</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-400 text-sm w-48">
                            <Search size={14} />
                            <span>Search...</span>
                        </div>
                        <Bell size={18} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                    </div>
                </header>

                {/* Dashboard Grid (Bento Box Layout) */}
                <div className="p-4 md:p-8 overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">

                        {/* CARD 1: Live Data (Google Sheets Sync) */}
                        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                                    <PieChart className="text-green-600" size={20} />
                                </div>
                            </div>
                            <h3 className="text-slate-500 font-medium text-sm mb-1">Live Revenue (Sheet Sync)</h3>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-4xl font-bold text-slate-900">$124,500</span>
                                <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-0.5 rounded-full mb-1">
                                    <ArrowUpRight size={14} className="mr-1" /> 12%
                                </span>
                            </div>
                            {/* Fake Chart Bars */}
                            <div className="flex gap-2 items-end h-24 w-full mt-4">
                                {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-md group-hover:bg-indigo-50 transition-colors relative overflow-hidden">
                                        <div
                                            className="absolute bottom-0 w-full bg-indigo-500 rounded-t-md transition-all duration-1000 ease-out"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CARD 2: Project Status (Docs) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <FileText className="text-blue-600" size={20} />
                                    </div>
                                    <MoreHorizontal className="text-slate-300" size={16} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg">Campaign Brief</h4>
                                <p className="text-xs text-slate-400 mt-1">Edited 2h ago by Sarah</p>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Drafting</span>
                                    <span>75%</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: Presentation Deck (Slides) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Presentation className="text-orange-500" size={20} />
                                </div>
                                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md">High Priority</span>
                            </div>
                            <h4 className="font-bold text-slate-900 mt-2">Q1 All Hands</h4>

                            <div className="mt-4 flex -space-x-2">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CARD 4: Quick Notes / ToDo */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-32 w-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                            <h4 className="font-bold text-lg mb-4 relative z-10">Pending Approvals</h4>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                                    <div className="h-4 w-4 rounded-full border-2 border-white/50"></div>
                                    <span className="text-sm font-medium">Approve Q1 Budget Sheet</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                                    <div className="h-4 w-4 rounded-full border-2 border-white/50"></div>
                                    <span className="text-sm font-medium">Review Copy for Landing Page</span>
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