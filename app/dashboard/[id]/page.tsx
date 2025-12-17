"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import useDrivePicker from "react-google-drive-picker";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams } from "next/navigation";
import Link from "next/link";

// 🔴 GOOGLE KEYS
const GOOGLE_API_KEY = "AIzaSyCJFRHpqhRgmkqivrhaQ_bSMv7lZA7Gz5o";
const GOOGLE_CLIENT_ID = "1072792448216-g7c565rslebga1m964jbi86esu46k24r.apps.googleusercontent.com";

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-600", blue: "bg-blue-600", green: "bg-emerald-600",
  grey: "bg-purple-600", orange: "bg-orange-600", teal: "bg-cyan-600", slate: "bg-slate-700",
};

// 🟢 HELPER: Detects links and status badges
const renderCellContent = (content: string) => {
  if (!content) return <span className="text-slate-300">-</span>;
  if (content.startsWith('http')) return <a href={content} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"><i className="fas fa-external-link-alt text-[10px]"></i> Link</a>;
  const lower = content.toLowerCase();
  if (['done', 'complete', 'active', 'paid', 'open'].includes(lower)) return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{content}</span>;
  if (['pending', 'waiting', 'in progress'].includes(lower)) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{content}</span>;
  if (['cancelled', 'failed', 'overdue', 'closed'].includes(lower)) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{content}</span>;
  return <span className="text-slate-700 font-medium">{content}</span>;
};

// --- SUB-COMPONENT: Sortable Manual Card ---
function SortableCard({ card, onClick, getBgColor }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-lg rounded-2xl p-6 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}>
        <div className="bg-white/16 p-1 rounded-full mb-4 backdrop-blur-sm"><i className="fas fa-folder-open text-3xl"></i></div>
        <h4 className="font-bold text-xl tracking-wide">{card.title}</h4>
        <div className="mt-3 text-[10px] uppercase tracking-widest bg-white/20 px-2 py-1 rounded flex items-center gap-1"><i className="fas fa-paperclip"></i> {card.resources ? card.resources.reduce((acc:any, block:any) => acc + (block.items?.length || 0), 0) : 0} Files</div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function DynamicDashboard() {
  const params = useParams();
  const dashboardId = params.id as string;
  
  // State
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleCards, setScheduleCards] = useState<any[]>([]); 
  const [missionCard, setMissionCard] = useState<any | null>(null); 
  const [manualCards, setManualCards] = useState<any[]>([]);     
  const [genericWidgets, setGenericWidgets] = useState<any[]>([]);
  
  // UI State
  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMapping, setIsMapping] = useState(false); // Controls the "Mapper" screen
  const [showDocPreview, setShowDocPreview] = useState<string | null>(null);
  const [openPicker] = useDrivePicker();
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const newItemTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const newItemUrlRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 🟢 FETCH EVERYTHING
  useEffect(() => {
    if(!dashboardId) return;
    const initDashboard = async () => {
        setLoading(true);
        const { data: dashConfig } = await supabase.from('dashboards').select('*').eq('id', dashboardId).single();
        if (!dashConfig) return alert("Dashboard not found");
        setConfig(dashConfig);
        await fetchSheetData(dashConfig);
        await fetchManualCards();
        await fetchGenericWidgets(); 
        setLoading(false);
    };
    initDashboard();
  }, [dashboardId]);

  // 🟢 FETCH GENERIC WIDGETS
  const fetchGenericWidgets = async () => {
    const { data: widgets } = await supabase.from('widgets').select('*').eq('dashboard_id', dashboardId);
    if (!widgets) return;

   const loadedWidgets: any[] = [];
    for (const widget of widgets) {
        try {
            const response = await fetch(widget.sheet_url);
            const csvText = await response.text();
            Papa.parse(csvText, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
                loadedWidgets.push({
                    id: widget.id,
                    title: widget.title,
                    type: 'generic-sheet', 
                    color: widget.color || 'blue',
                    data: results.data, 
                    columns: results.meta.fields, 
                    rowCount: results.data.length,
                    sheet_url: widget.sheet_url,
                    settings: widget.settings || {} 
                });
            }});
        } catch (e) { console.error("Error fetching widget", widget.title); }
    }
    setTimeout(() => setGenericWidgets(loadedWidgets), 500);
  };

  const fetchSheetData = async (currentConfig: any) => {
    if (currentConfig.sheet_url_schedule) {
        const response = await fetch(currentConfig.sheet_url_schedule);
        Papa.parse(await response.text(), { header: true, skipEmptyLines: true, : (h) transformHeader: (h: string) => h.trim(), complete: (results: any) => {
            const cards = results.data.filter((row: any) => row["Week Label"]).map((row: any, index: number) => ({
                id: `sheet1-${index}`, title: row["Week Label"], date_label: row["Date"] || "", scripture: row["Passage"] || "", worship: row["Song List"] || "", response_song: row["Response Song"] || "", offering: row["Offering"] || "", resources: [], color: row["Color"] ? row["Color"].toLowerCase() : "purple", source: "google-sheet"
            }));
            setScheduleCards(cards);
        }});
    }
    if (currentConfig.sheet_url_missions) {
        const response = await fetch(currentConfig.sheet_url_missions);
        Papa.parse(await response.text(), { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
            const data = results.data;
            if (data.length > 0) {
                 const row1 = data[0]; 
                 const tripList = data.map((r: any) => ({ name: r[""] || r["Trip"] || Object.values(r)[5], spots: r["Open Spots_1"] || Object.values(r)[6] })).filter((t: any) => t.name && t.spots && t.name !== "Trip");
                 // 🟢 FULL PARSING RESTORED
                 const getLocation = data.find((r: any) => r["Detail"]?.includes("Location"))?.["Value"] || "TBD";
                 const getDate = data.find((r: any) => r["Detail"]?.includes("Departure Date"))?.["Value"] || "TBD";
                 const getOpen = data.find((r: any) => r["Detail"]?.includes("Open Spots"))?.["Value"] || "0";
                 const getStatus = data.find((r: any) => r["Detail"]?.includes("Status"))?.["Value"] || "Open";

                 setMissionCard({
                    id: 'missions-status', title: "Missions Status",
                    totalNonStaff: row1["Total Non-Staff"], totalStaff: row1["Total Staff"], percentNonStaff: row1["% of Non-Staff on Tr"] || row1["% of Non-Staff on Trips"], percentStaff: row1["% of Staff on Trips"], totalOpen: row1["Open Spots"],
                    upcomingLoc: getLocation, upcomingDate: getDate, upcomingOpen: getOpen, upcomingStatus: getStatus, trips: tripList, color: "teal", source: "missions-dashboard"
                });
            }
        }});
    }
  };

  const fetchManualCards = async () => {
    const { data } = await supabase.from('Weeks').select('*').eq('dashboard_id', dashboardId).order('sort_order', { ascending: true });
    if (data) setManualCards(data.map((item: any) => ({ ...item, source: 'manual' })));
  };

  // --- ACTIONS ---
  const saveMapping = async (newSettings: any) => {
      const updatedCard = { ...activeCard, settings: newSettings };
      setActiveCard(updatedCard);
      setGenericWidgets(prev => prev.map(w => w.id === activeCard.id ? updatedCard : w));
      setIsMapping(false);
      await supabase.from('widgets').update({ settings: newSettings }).eq('id', activeCard.id);
  };

  const deleteCard = async (id: any) => { 
      if (!id) return alert("Error: ID missing");
      if (String(id).startsWith("sheet") || id === 'missions-status' || String(id).includes('generic')) return; 
      if(!confirm("Delete this card permanently?")) return; 
      const { error } = await supabase.from('Weeks').delete().eq('id', id); 
      if (error) { alert("Error: " + error.message); } else { window.location.reload(); }
  };
  
  const addNewCard = async () => { 
      const newOrder = manualCards.length; 
      const defaultResources = [{ title: "General Files", items: [] }];
      const { data } = await supabase.from('Weeks').insert([{ title: "New Resource Hub", date_label: "", resources: defaultResources, color: "green", sort_order: newOrder, dashboard_id: dashboardId }]).select(); 
      if (data) { const newCard = { ...data[0], source: 'manual' }; setManualCards([...manualCards, newCard]); setActiveCard(newCard); setIsEditing(true); } 
  };

  const handleDragEnd = async (event: any) => { const { active, over } = event; if (active.id !== over.id) { setManualCards((items) => { const oldIndex = items.findIndex((item) => item.id === active.id); const newIndex = items.findIndex((item) => item.id === over.id); const newOrder = arrayMove(items, oldIndex, newIndex); saveNewOrder(newOrder); return newOrder; }); } };
  const saveNewOrder = async (items: any[]) => { const updates = items.map((card, index) => ({ id: card.id, sort_order: index })); for (const item of updates) { await supabase.from('Weeks').update({ sort_order: item.sort_order }).eq('id', item.id); } };
  
  // Helpers
  const doesCardMatch = (card: any) => { if(!searchQuery) return true; return JSON.stringify(card).toLowerCase().includes(searchQuery.toLowerCase()); };
  const updateColor = async (newColor: string) => { if (!activeCard || !activeCard.source?.includes("manual")) return; const updatedCard = { ...activeCard, color: newColor }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ color: newColor }).eq('id', activeCard.id); };
  const handleOpenPicker = (bIdx: number) => { setActiveBlockIndex(bIdx); openPicker({ clientId: GOOGLE_CLIENT_ID, developerKey: GOOGLE_API_KEY, viewId: "DOCS", showUploadView: true, showUploadFolders: true, supportDrives: true, multiselect: true, callbackFunction: (data) => { if (data.action === "picked") addFilesToBlock(bIdx, data.docs); } }); };
  const addFilesToBlock = async (bIdx: number, files: any[]) => { const currentBlocks = getBlocks(activeCard); const newItems = files.map(file => ({ title: file.name, url: file.url, type: 'google-drive', iconUrl: file.iconUrl })); currentBlocks[bIdx].items = [...currentBlocks[bIdx].items, ...newItems]; updateResources(currentBlocks); };
  const getBlocks = (card: any) => { const res = card.resources || []; if (res.length === 0) return []; if (!res[0].items) return [{ title: "General Files", items: res }]; return res; };
  const addBlock = async () => { const newBlockName = prompt("Name your new Category:"); if (!newBlockName) return; updateResources([...getBlocks(activeCard), { title: newBlockName, items: [] }]); };
  const deleteBlock = async (bIdx: number) => { if(!confirm("Delete block?")) return; updateResources(getBlocks(activeCard).filter((_, idx) => idx !== bIdx)); };
  const addItemToBlock = async (bIdx: number) => { const titleInput = newItemTitleRefs.current[`block-${bIdx}`]; const urlInput = newItemUrlRefs.current[`block-${bIdx}`]; if (!titleInput?.value || !urlInput?.value) return alert("Enter info"); const currentBlocks = getBlocks(activeCard); currentBlocks[bIdx].items.push({ title: titleInput.value, url: urlInput.value, type: 'link' }); updateResources(currentBlocks); titleInput.value = ""; urlInput.value = ""; };
  const deleteItemFromBlock = async (bIdx: number, iIdx: number) => { if(!confirm("Remove file?")) return; const currentBlocks = getBlocks(activeCard); currentBlocks[bIdx].items = currentBlocks[bIdx].items.filter((_: any, idx: number) => idx !== iIdx); updateResources(currentBlocks); };
  const updateResources = async (newBlocks: any[]) => { const updatedCard = { ...activeCard, resources: newBlocks }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ resources: newBlocks }).eq('id', activeCard.id); };
  const handleSave = async () => { if (!activeCard || activeCard.source?.includes("sheet")) return; const newTitle = titleRef.current?.innerText || activeCard.title; const updated = { ...activeCard, title: newTitle }; setManualCards(manualCards.map(c => c.id === activeCard.id ? updated : c)); setActiveCard(updated); await supabase.from('Weeks').update({ title: newTitle }).eq('id', activeCard.id); };
  const setActiveModal = (card: any) => { if (isEditing && activeCard) handleSave(); setIsEditing(false); setIsMapping(false); setActiveCard(card); setShowDocPreview(null); };
  const toggleEditMode = () => { if(isEditing) handleSave(); setIsEditing(!isEditing); }
  const getBgColor = (c: string) => COLOR_MAP[c] || "bg-slate-700";
  const isGoogleDoc = (url: string) => url.includes("docs.google.com") || url.includes("drive.google.com");
  const getEmbedUrl = (url: string) => { if(url.includes("/document/d/")) return url.replace("/edit", "/preview"); if(url.includes("/spreadsheets/d/")) return url.replace("/edit", "/preview"); if(url.includes("/presentation/d/")) return url.replace("/edit", "/preview"); return url; };
  const getFileIcon = (item: any) => { if (item.iconUrl) return <img src={item.iconUrl} className="w-5 h-5" alt="icon" />; const title = item.title.toLowerCase(); let iconClass = "fas fa-link text-slate-400"; if (title.includes("calendar")) iconClass = "fas fa-calendar-alt text-emerald-500"; else if (title.includes("plan") || title.includes("strategy")) iconClass = "fas fa-map text-blue-500"; else if (title.includes("offering")) iconClass = "fas fa-hand-holding-heart text-green-500"; else if (isGoogleDoc(item.url)) iconClass = "fab fa-google-drive text-slate-500"; return <i className={`${iconClass} text-lg`}></i>; };
  const isCardEditable = (card: any) => card && card.source === 'manual';

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="pb-20 min-h-screen">
      <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors mr-2" title="Back"><i className="fas fa-arrow-left"></i></Link>
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">{config?.title ? config.title.substring(0, 2).toUpperCase() : 'DB'}</div>
              <span className="font-semibold text-lg tracking-tight hidden md:block">{config?.title || "Loading..."}</span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { if (!config?.share_token) return alert("Error: No token."); const link = `${window.location.origin}/join/${config.share_token}`; navigator.clipboard.writeText(link); alert("Invite Link Copied!"); }} className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md bg-purple-600 border border-purple-500 hover:bg-purple-500 text-white transition-colors shadow-sm ml-2"><i className="fas fa-user-plus"></i><span>Invite</span></button>
                <div className="relative"><i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i><input type="text" placeholder="find a document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 md:w-64 transition-all"/></div>
                <button onClick={addNewCard} className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white transition-colors shadow-sm"><i className="fas fa-plus"></i><span>New Card</span></button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* SCHEDULE */}
        {scheduleCards.some(doesCardMatch) && (
            <div><div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><i className="fas fa-calendar-alt"></i> Weekly Schedule</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{scheduleCards.filter(doesCardMatch).map((card) => (<div key={card.id} onClick={() => setActiveModal(card)} className={`cursor-pointer hover:-translate-y-1 hover:shadow-md rounded-xl p-4 text-white flex flex-row items-center text-left h-24 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}><div className="bg-white/20 h-12 w-12 rounded-full flex items-center justify-center mr-4 shrink-0 backdrop-blur-sm"><i className="fas fa-calendar-alt text-xl"></i></div><div><h4 className="font-bold text-lg leading-tight">{card.title}</h4><div className="text-xs font-medium opacity-80 mt-1">{card.date_label}</div></div></div>))}</div></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MISSIONS & WIDGETS */}
            <div className="lg:col-span-1 space-y-6">
                 {missionCard && doesCardMatch(missionCard) && (<div><div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><i className="fas fa-plane-departure"></i> Missions</div><div onClick={() => setActiveModal(missionCard)} className={`cursor-pointer hover:-translate-y-1 hover:shadow-md rounded-xl p-5 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group bg-cyan-600`}><div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm"><i className="fas fa-globe-americas text-2xl"></i></div><h4 className="font-bold text-lg tracking-wide">{missionCard.title}</h4><div className="mt-3 text-[10px] uppercase tracking-widest bg-black/20 px-2 py-1 rounded">View Dashboard</div></div></div>)}
                 
                 {/* 🟢 MODIFIED WIDGETS: Removed Header + Fixed Height */}
                 {genericWidgets.map((widget) => (
                    <div key={widget.id}>
                        <div onClick={() => setActiveModal(widget)} className={`cursor-pointer hover:-translate-y-1 hover:shadow-lg rounded-xl p-0 relative overflow-hidden group transition-all bg-white border border-slate-200 h-40 flex flex-col`}>
                            <div className={`h-2 w-full shrink-0 ${getBgColor(widget.color || 'blue').replace('bg-', 'bg-')}`}></div>
                            <div className="p-5 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-white group-hover:${getBgColor(widget.color || 'blue')} transition-colors`}>
                                        <i className={`fas ${widget.settings?.viewMode === 'card' ? 'fa-th-large' : 'fa-table'} text-lg`}></i>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">CSV</div>
                                </div>
                                <div className="mt-auto pb-2">
                                    <h4 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {widget.title}
                                    </h4>
                                    <div className="text-xs text-slate-400 font-medium mt-1">
                                        {widget.rowCount || 0} records
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 ))}
            </div>
            
            {/* MANUAL */}
            <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider"><i className="fas fa-layer-group"></i> Planning & Resources</div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={manualCards.filter(doesCardMatch)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {manualCards.filter(doesCardMatch).map((card) => (<SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} />))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {activeCard && (
        <div onClick={() => setActiveModal(null)} className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-6 bg-slate-900/70 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className={`bg-white w-full ${showDocPreview || activeCard.type === 'generic-sheet' ? "max-w-6xl h-[85vh]" : "max-w-2xl"} rounded-2xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className={`${getBgColor(activeCard.color || 'rose')} p-6 flex justify-between items-center text-white shrink-0 transition-colors`}>
              <div>
                 <h3 className="text-2xl font-bold">{activeCard.title}</h3>
                 {showDocPreview && <div className="text-xs opacity-75">Document Preview</div>}
              </div>
              <div className="flex items-center gap-3">
                 {/* 🟢 MODIFIED BUTTON: "Configure View" if settings exist */}
                 {activeCard.type === 'generic-sheet' && !isMapping && (
                     <button onClick={() => setIsMapping(true)} className="px-3 py-1 rounded text-sm font-bold bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2">
                        <i className={`fas ${activeCard.settings?.viewMode ? 'fa-cog' : 'fa-magic'}`}></i> {activeCard.settings?.viewMode ? "Configure View" : "Visualize"}
                     </button>
                 )}
                 {(showDocPreview || activeCard.sheet_url || activeCard.source?.includes("sheet")) && (
                    <a href={showDocPreview ? showDocPreview.replace("/preview", "/edit") : activeCard.sheet_url || activeCard.sheet_url_schedule} target="_blank" rel="noreferrer" className="px-3 py-1 rounded text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200 flex items-center gap-2"><i className="fas fa-external-link-alt"></i> <span className="hidden sm:inline">Open in {activeCard.source?.includes("sheet") || activeCard.type === 'generic-sheet' ? "Sheets" : "Docs"}</span></a>
                 )}
                 {!showDocPreview && isCardEditable(activeCard) && (<button onClick={toggleEditMode} className={`px-3 py-1 rounded text-sm font-medium transition-colors border ${isEditing ? 'bg-white text-slate-900 border-white' : 'bg-black/20 text-white border-transparent hover:bg-black/40'}`}><i className={`fas ${isEditing ? 'fa-check' : 'fa-pen'} mr-2`}></i>{isEditing ? "Done" : "Add or Remove Files"}</button>)}
                 {isEditing && !showDocPreview && isCardEditable(activeCard) && (<button onClick={() => deleteCard(activeCard.id)} className="bg-red-500 px-3 py-1 rounded text-sm font-bold hover:bg-red-600 transition-colors"><i className="fas fa-trash"></i></button>)}
                 {showDocPreview && <button onClick={() => setShowDocPreview(null)} className="bg-white/20 px-3 py-1 rounded text-sm font-medium"><i className="fas fa-arrow-left mr-2"></i> Back</button>}
                 <button onClick={() => setActiveModal(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><i className="fas fa-times text-xl"></i></button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-0 overflow-y-auto custom-scroll flex flex-col h-full bg-slate-50">
              {/* GENERIC SHEET HANDLER */}
              {activeCard.type === 'generic-sheet' ? (
                  isMapping ? (
                      // 1. MAPPING SCREEN
                      <div className="p-12 flex flex-col items-center justify-center h-full">
                          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-lg w-full">
                              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><i className="fas fa-magic text-purple-500"></i> Configure Card View</h2>
                              <p className="text-slate-500 text-sm mb-6">Map your CSV columns to beautiful card fields.</p>
                              <div className="space-y-4">
                                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">View Mode</label><select id="viewMode" defaultValue={activeCard.settings?.viewMode || 'table'} className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 font-medium bg-slate-50"><option value="table">Table (Default)</option><option value="card">Card Grid</option></select></div>
                                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title Column</label><select id="titleCol" defaultValue={activeCard.settings?.titleCol || ''} className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"><option value="">-- Select Column --</option>{activeCard.columns.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subtitle / Date Column</label><select id="subtitleCol" defaultValue={activeCard.settings?.subtitleCol || ''} className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"><option value="">-- Select Column --</option>{activeCard.columns.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tag / Status Column</label><select id="tagCol" defaultValue={activeCard.settings?.tagCol || ''} className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"><option value="">-- Select Column --</option>{activeCard.columns.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                              </div>
                              <div className="mt-8 flex gap-3"><button onClick={() => { const viewMode = (document.getElementById('viewMode') as HTMLSelectElement).value; const titleCol = (document.getElementById('titleCol') as HTMLSelectElement).value; const subtitleCol = (document.getElementById('subtitleCol') as HTMLSelectElement).value; const tagCol = (document.getElementById('tagCol') as HTMLSelectElement).value; saveMapping({ viewMode, titleCol, subtitleCol, tagCol }); }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Save View</button><button onClick={() => setIsMapping(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button></div>
                          </div>
                      </div>
                  ) : activeCard.settings?.viewMode === 'card' ? (
                      // 2. CARD VIEW RENDERER
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {/* 🟢 FILTERED: Only show cards where Title exists */}
                           {activeCard.data.filter((row:any) => row[activeCard.settings.titleCol]).map((row:any, idx:number) => (
                               <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-lg text-slate-800 line-clamp-2">{row[activeCard.settings.titleCol] || "Untitled"}</h4>
                                       {activeCard.settings.tagCol && row[activeCard.settings.tagCol] && (<span className="shrink-0 ml-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">{row[activeCard.settings.tagCol]}</span>)}
                                   </div>
                                   {activeCard.settings.subtitleCol && (<div className="text-sm text-slate-500 font-medium mb-4">{row[activeCard.settings.subtitleCol]}</div>)}
                                   <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-1">{activeCard.columns.filter((c:string) => c !== activeCard.settings.titleCol && c !== activeCard.settings.subtitleCol && c !== activeCard.settings.tagCol).slice(0, 3).map((col:string) => (<div key={col} className="flex justify-between text-xs"><span className="text-slate-400 font-medium">{col}:</span><span className="text-slate-700 font-mono text-right truncate max-w-[60%]">{renderCellContent(row[col])}</span></div>))}</div>
                               </div>
                           ))}
                      </div>
                  ) : (
                      // 3. TABLE VIEW (Default)
                      <div className="flex flex-col h-full bg-slate-50">
                         <div className="px-8 py-4 border-b border-slate-200 bg-white flex justify-between items-center"><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Source: Google Sheet</div><div className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-mono">{activeCard.rowCount} Rows</div></div>
                         <div className="flex-1 overflow-auto p-8 custom-scroll">
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm"><tr>{activeCard.columns.map((col:string, idx:number) => (<th key={idx} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50">{col}</th>))}</tr></thead>
                                    <tbody className="bg-white divide-y divide-slate-200">{activeCard.data.map((row:any, rIdx:number) => (<tr key={rIdx} className="hover:bg-blue-50/50 transition-colors group">{activeCard.columns.map((col:string, cIdx:number) => (<td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm">{renderCellContent(row[col])}</td>))}</tr>))}</tbody>
                                </table>
                            </div>
                         </div>
                      </div>
                  )
              ) : activeCard.id === "missions-status" ? (
                  // 🟢 MISSIONS LOGIC RESTORED
                  <div className="p-0 bg-slate-50 min-h-full">
                      <div className="bg-sky-50 p-8 border-b border-sky-100 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div>
                              <div className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">Upcoming Departure</div>
                              <h2 className="text-3xl font-bold text-slate-800 mb-1">{activeCard.upcomingLoc} Team</h2>
                              <div className="flex items-center gap-2 text-slate-500"><i className="far fa-calendar-alt"></i> {activeCard.upcomingDate}</div>
                          </div>
                          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-sky-100 text-center min-w-[120px]">
                              <div className="text-4xl font-bold text-sky-600">{activeCard.upcomingOpen}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Spots</div>
                          </div>
                      </div>
                      <div className="p-8">
                          <div className="flex items-center gap-2 mb-4"><i className="fas fa-ticket-alt text-slate-400"></i><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Open Registrations</h4></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {activeCard.trips.map((trip: any, idx: number) => (
                                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                      <div><div className="font-bold text-slate-800 text-lg">{trip.name}</div><div className="text-xs text-slate-400 mt-1">Registration Open</div></div>
                                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{trip.spots} Spots</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="bg-white p-8 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-6">2026 Statistics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div>
                                  <div className="flex items-end gap-3 mb-2"><span className="text-4xl font-bold text-slate-800">{activeCard.totalNonStaff}</span><span className="text-sm text-slate-500 mb-1">Non-Staff ({activeCard.percentNonStaff})</span></div>
                                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: activeCard.percentNonStaff }}></div></div>
                              </div>
                              <div>
                                  <div className="flex items-end gap-3 mb-2"><span className="text-4xl font-bold text-slate-800">{activeCard.totalStaff}</span><span className="text-sm text-slate-500 mb-1">Staff ({activeCard.percentStaff})</span></div>
                                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: activeCard.percentStaff }}></div></div>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : activeCard.source?.includes("sheet") ? (
                // ... Schedule Logic ...
                <div className="p-8 space-y-8">
                     {activeCard.scripture && <div><div className="flex items-center gap-2 mb-3"><i className="fas fa-book-open text-rose-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Primary Text</span></div><div className="text-lg text-slate-800 whitespace-pre-wrap">{activeCard.scripture}</div></div>}
                     {activeCard.worship && <div className="border-t border-slate-200 pt-6"><div className="flex items-center gap-2 mb-3"><i className="fas fa-music text-purple-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Worship</span></div><div className="text-slate-700 whitespace-pre-wrap pl-4 border-l-4 border-purple-200 py-1">{activeCard.worship}</div></div>}
                     {activeCard.response_song && <div className="mt-2 ml-4"><div className="bg-purple-50 text-purple-900 p-3 rounded-md text-sm italic border border-purple-100 shadow-sm">{activeCard.response_song}</div></div>}
                     {activeCard.offering && <div className="border-t border-slate-200 pt-6"><div className="flex items-center gap-2 mb-3"><i className="fas fa-hand-holding-heart text-green-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Offering</span></div><div className="text-slate-700">{activeCard.offering}</div></div>}
                </div>
              ) : (
                /* MANUAL CARD VIEW */
                !showDocPreview && (
                <div className="p-0">
                    <div className="p-8">
                        {isEditing && (<div className="flex flex-col gap-3">{getBlocks(activeCard).length === 0 && (<button onClick={() => updateResources([{ title: "General Files", items: [] }])} className="w-full py-4 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"><i className="fas fa-plus-circle mr-2"></i> Start Adding Files</button>)}<button onClick={addBlock} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">+ Create New Category Block</button></div>)}
                        {getBlocks(activeCard).map((block: any, bIdx: number) => (
                            <div key={bIdx} className="mb-8">
                                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{block.title}</h4>{isEditing && <button onClick={() => deleteBlock(bIdx)} className="text-[10px] text-red-400 hover:text-red-600 uppercase font-bold">Delete Block</button>}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {block.items.map((item: any, iIdx: number) => (
                                        <div key={iIdx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-400 transition-all group cursor-pointer relative">
                                            <div className="flex items-center gap-4 flex-1" onClick={() => isGoogleDoc(item.url) ? setShowDocPreview(getEmbedUrl(item.url)) : window.open(item.url, '_blank')}>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-500 flex items-center justify-center transition-colors">{getFileIcon(item)}</div>
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600">{item.title}</div>
                                            </div>
                                            {isEditing && <button onClick={() => deleteItemFromBlock(bIdx, iIdx)} className="absolute top-2 right-2 text-slate-200 hover:text-red-500 p-1"><i className="fas fa-times-circle"></i></button>}
                                        </div>
                                    ))}
                                </div>
                                {isEditing && (<div className="mt-3 flex gap-2"><button onClick={() => handleOpenPicker(bIdx)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 rounded text-xs font-bold flex items-center gap-2 border border-yellow-200"><i className="fab fa-google-drive"></i> Add from Drive</button><div className="w-px bg-slate-300 mx-1"></div><input ref={(el) => { newItemTitleRefs.current[`block-${bIdx}`] = el }} type="text" placeholder="Name your file..." className="flex-1 p-2 text-xs border rounded bg-slate-50 text-slate-900 placeholder-slate-500" /><input ref={(el) => { newItemUrlRefs.current[`block-${bIdx}`] = el }} type="text" placeholder="paste file url..." className="flex-1 p-2 text-xs border rounded bg-slate-50 text-slate-900 placeholder-slate-500" /><button onClick={() => addItemToBlock(bIdx)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 rounded text-xs font-bold">Add Link</button></div>)}
                            </div>
                        ))}
                    </div>
                </div>
                )
              )}
              {showDocPreview && <iframe src={showDocPreview} className="w-full h-full border-none bg-white flex-1" title="Doc Preview"></iframe>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}