"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import useDrivePicker from "react-google-drive-picker";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import DashboardChat from "@/components/DashboardChat";

// 🔴 GOOGLE KEYS
const GOOGLE_API_KEY = "AIzaSyCJFRHpqhRgmkqivrhaQ_bSMv7lZA7Gz5o";
const GOOGLE_CLIENT_ID = "1072792448216-g7c565rslebga1m964jbi86esu46k24r.apps.googleusercontent.com";

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-600", blue: "bg-blue-600", green: "bg-emerald-600",
  grey: "bg-purple-600", orange: "bg-orange-600", teal: "bg-cyan-600", slate: "bg-slate-700",
};

// 🟢 ICON OPTIONS
const ICON_OPTIONS = [
  "fa-folder-open", "fa-calendar-alt", "fa-music", "fa-book-open", 
  "fa-users", "fa-hand-holding-heart", "fa-money-bill-wave", "fa-bullhorn", 
  "fa-video", "fa-clipboard-list", "fa-lightbulb", "fa-praying-hands"
];

const toCSVUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("docs.google.com/spreadsheets")) {
    return url.replace(/\/edit.*$/, '/export?format=csv');
  }
  return url;
};

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
function SortableCard({ card, onClick, getBgColor, variant = 'vertical' }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, data: { ...card } });
  
  const userIcon = card.settings?.icon;
  let defaultIcon = "fa-folder-open";
  if (variant === 'horizontal') defaultIcon = "fa-calendar-alt";
  if (variant === 'mission') defaultIcon = "fa-globe-americas";
  const displayIcon = userIcon || defaultIcon;

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.3 : 1 };
  
  if (variant === 'mission') {
      return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md rounded-xl p-5 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group bg-cyan-600`}>
            <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm"><i className={`fas ${displayIcon} text-2xl`}></i></div>
            <h4 className="font-bold text-lg tracking-wide">{card.title}</h4>
            <div className="mt-3 text-[10px] uppercase tracking-widest bg-black/20 px-2 py-1 rounded">View Dashboard</div>
        </div>
      );
  }

  if (variant === 'horizontal') {
      return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md rounded-xl p-4 text-white flex flex-row items-center text-left h-24 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}>
            <div className="bg-white/20 h-12 w-12 rounded-full flex items-center justify-center mr-4 shrink-0 backdrop-blur-sm"><i className={`fas ${displayIcon} text-xl`}></i></div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg leading-tight truncate">{card.title}</h4>
                <div className="text-xs font-medium opacity-80 mt-1 truncate">{card.date_label || "No Date"}</div>
            </div>
        </div>
      );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-lg rounded-2xl p-6 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}>
        <div className="bg-white/16 p-1 rounded-full mb-4 backdrop-blur-sm"><i className={`fas ${displayIcon} text-3xl`}></i></div>
        <h4 className="font-bold text-xl tracking-wide line-clamp-2">{card.title}</h4>
        <div className="mt-3 text-[10px] uppercase tracking-widest bg-white/20 px-2 py-1 rounded flex items-center gap-1"><i className="fas fa-paperclip"></i> {card.resources ? card.resources.reduce((acc:any, block:any) => acc + (block.items?.length || 0), 0) : 0} Files</div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function DynamicDashboard() {
  const params = useParams();
  const dashboardId = params.id as string;
  
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleCards, setScheduleCards] = useState<any[]>([]); 
  const [missionCard, setMissionCard] = useState<any | null>(null); 
  const [manualCards, setManualCards] = useState<any[]>([]);     
  const [genericWidgets, setGenericWidgets] = useState<any[]>([]);
  const [sections, setSections] = useState<string[]>(["Planning & Resources"]); 
  
  const [scheduleTitle, setScheduleTitle] = useState("Weekly Schedule");
  const [missionsTitle, setMissionsTitle] = useState("Missions");

  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMapping, setIsMapping] = useState(false); 
  const [showDocPreview, setShowDocPreview] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false); 
  const [openPicker] = useDrivePicker();
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const newItemTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const newItemUrlRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if(!dashboardId) return;
    const initDashboard = async () => {
        setLoading(true);
        const { data: dashConfig } = await supabase.from('dashboards').select('*').eq('id', dashboardId).single();
        if (!dashConfig) return alert("Dashboard not found");
        setConfig(dashConfig);
        if (dashConfig.settings?.sections) { setSections(dashConfig.settings.sections); }
        if (dashConfig.settings?.scheduleTitle) { setScheduleTitle(dashConfig.settings.scheduleTitle); }
        if (dashConfig.settings?.missionsTitle) { setMissionsTitle(dashConfig.settings.missionsTitle); }
        await fetchSheetData(dashConfig);
        await fetchManualCards();
        await fetchGenericWidgets(); 
        setLoading(false);
    };
    initDashboard();
  }, [dashboardId]);

  const loadSheetData = async (url: string, card: any) => {
    try {
        const csvUrl = toCSVUrl(url);
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        Papa.parse(csvText, { 
            header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), 
            complete: (results: any) => {
                const enrichedCard = { ...card, data: results.data, columns: results.meta.fields, rowCount: results.data.length, sheet_url: url, settings: { ...card.settings, connectedSheet: url } };
                setActiveCard(enrichedCard);
                setManualCards(prev => prev.map(c => c.id === card.id ? enrichedCard : c));
            }
        });
    } catch (e) { console.error("Failed to load sheet data", e); alert("Could not load sheet. Ensure it is 'Shared > Anyone with the link'."); }
  };

  const fetchGenericWidgets = async () => {
    const { data: widgets } = await supabase.from('widgets').select('*').eq('dashboard_id', dashboardId);
    if (!widgets) return;
    const loadedWidgets: any[] = [];
    for (const widget of widgets) {
        try {
            const csvUrl = toCSVUrl(widget.sheet_url);
            const response = await fetch(csvUrl);
            const csvText = await response.text();
            Papa.parse(csvText, { 
                header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), 
                complete: (results: any) => {
                    loadedWidgets.push({ id: widget.id, title: widget.title, type: 'generic-sheet', color: widget.color || 'blue', data: results.data, columns: results.meta.fields, rowCount: results.data.length, sheet_url: widget.sheet_url, settings: widget.settings || {} });
                }
            });
        } catch (e) { console.error("Error fetching widget", widget.title); }
    }
    setTimeout(() => setGenericWidgets(loadedWidgets), 500);
  };

  const fetchSheetData = async (currentConfig: any) => {
     if (currentConfig.sheet_url_schedule) {
        const response = await fetch(currentConfig.sheet_url_schedule);
        Papa.parse(await response.text(), { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
                const cards = results.data.filter((row: any) => row["Week Label"]).map((row: any, index: number) => ({ id: `sheet1-${index}`, title: row["Week Label"], date_label: row["Date"] || "", scripture: row["Passage"] || "", worship: row["Song List"] || "", response_song: row["Response Song"] || "", offering: row["Offering"] || "", resources: [], color: row["Color"] ? row["Color"].toLowerCase() : "purple", source: "google-sheet", category: "Weekly Schedule" }));
                setScheduleCards(cards);
            }});
    }
    if (currentConfig.sheet_url_missions) {
        const response = await fetch(currentConfig.sheet_url_missions);
        Papa.parse(await response.text(), { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
                const data = results.data;
                if (data.length > 0) {
                     const row1 = data[0]; 
                     setMissionCard({ id: 'missions-status', title: "Missions Status", totalNonStaff: row1["Total Non-Staff"], totalStaff: row1["Total Staff"], percentNonStaff: row1["% of Non-Staff on Tr"] || row1["% of Non-Staff on Trips"], percentStaff: row1["% of Staff on Trips"], totalOpen: row1["Open Spots"], upcomingLoc: data.find((r:any) => r["Detail"]?.includes("Location"))?.["Value"] || "TBD", upcomingDate: data.find((r:any) => r["Detail"]?.includes("Departure Date"))?.["Value"] || "TBD", upcomingOpen: data.find((r:any) => r["Detail"]?.includes("Open Spots"))?.["Value"] || "0", upcomingStatus: data.find((r:any) => r["Detail"]?.includes("Status"))?.["Value"] || "Open", trips: data.map((r: any) => ({ name: r[""] || r["Trip"] || Object.values(r)[5], spots: r["Open Spots_1"] || Object.values(r)[6] })).filter((t: any) => t.name && t.spots && t.name !== "Trip"), color: "teal", source: "missions-dashboard", category: "Missions" });
                }
            }});
    }
  };

  const fetchManualCards = async () => {
    const { data } = await supabase.from('Weeks').select('*').eq('dashboard_id', dashboardId).order('sort_order', { ascending: true });
    if (data) setManualCards(data.map((item: any) => ({ ...item, source: 'manual' })));
  };

  const saveMapping = async (newSettings: any) => {
      const updatedCard = { ...activeCard, settings: newSettings };
      setActiveCard(updatedCard);
      if (activeCard.type === 'generic-sheet') {
          setGenericWidgets(prev => prev.map(w => w.id === activeCard.id ? updatedCard : w));
          await supabase.from('widgets').update({ settings: newSettings }).eq('id', activeCard.id);
      } else {
          setManualCards(prev => prev.map(c => c.id === activeCard.id ? updatedCard : c));
          await supabase.from('Weeks').update({ settings: newSettings }).eq('id', activeCard.id);
      }
      setIsMapping(false);
  };

  const deleteCard = async (card: any) => { 
      if (!card || !card.id) return alert("Error: Card missing");
      if(!confirm("Delete this card permanently?")) return; 

      if (card.source === 'manual') {
          setManualCards(prev => prev.filter(c => c.id !== card.id));
          await supabase.from('Weeks').delete().eq('id', card.id);
      } else if (card.type === 'generic-sheet') {
          setGenericWidgets(prev => prev.filter(c => c.id !== card.id));
          await supabase.from('widgets').delete().eq('id', card.id);
      }
      setActiveCard(null);
  };
  
  const addNewCard = async (sectionName: string) => { 
      const newOrder = manualCards.length; 
      const defaultResources = [{ title: "General Files", items: [] }];
      const settings = { category: sectionName };
      
      const { data } = await supabase.from('Weeks').insert([{ 
          title: "New Resource Hub", 
          date_label: "", 
          resources: defaultResources, 
          color: "green", 
          sort_order: newOrder, 
          dashboard_id: dashboardId, 
          settings: settings 
      }]).select(); 
      
      if (data) { 
          const newCard = { ...data[0], source: 'manual' }; 
          setManualCards([...manualCards, newCard]); 
          setActiveCard(newCard); 
          setIsEditing(true); 
      } 
  };

  const updateIcon = async (newIcon: string) => {
      if (!activeCard) return;
      const newSettings = { ...activeCard.settings, icon: newIcon };
      const updatedCard = { ...activeCard, settings: newSettings };
      setActiveCard(updatedCard);
      if (activeCard.type === 'generic-sheet') { setGenericWidgets(prev => prev.map(w => w.id === activeCard.id ? updatedCard : w)); await supabase.from('widgets').update({ settings: newSettings }).eq('id', activeCard.id); } 
      else { setManualCards(prev => prev.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ settings: newSettings }).eq('id', activeCard.id); }
  };

  const handleDragStart = (event: any) => { setActiveDragItem(event.active.data.current); };
  const handleDragEnd = async (event: any) => { 
    const { active, over } = event; 
    setActiveDragItem(null);
    if (!over) return;
    const activeId = active.id; const overId = over.id;
    const allItems = [...manualCards, ...genericWidgets];
    const activeItem = allItems.find(i => i.id === activeId);
    
    if (overId === "Weekly Schedule" || overId === scheduleTitle) { if (activeItem) updateCardCategory(activeItem, "Weekly Schedule"); return; }
    if (overId === "Missions" || overId === missionsTitle) { if (activeItem) updateCardCategory(activeItem, "Missions"); return; }
    if (sections.includes(overId)) { if (activeItem) updateCardCategory(activeItem, overId); return; }

    if (activeId !== overId) {
        setManualCards((items) => { const oldIndex = items.findIndex((item) => item.id === activeId); const newIndex = items.findIndex((item) => item.id === overId); return arrayMove(items, oldIndex, newIndex); });
        const overItem = allItems.find(i => i.id === overId) || scheduleCards.find(c => c.id === overId) || missionCard?.id === overId;
        if (activeItem && overItem) {
            let targetCategory = overItem.settings?.category || overItem.category;
            if (!targetCategory && overItem.source === 'google-sheet') targetCategory = "Weekly Schedule";
            if (overId === 'missions-status') targetCategory = "Missions";
            if (!targetCategory) targetCategory = sections[0];
            const currentCategory = activeItem.settings?.category || sections[0];
            if (currentCategory !== targetCategory) { updateCardCategory(activeItem, targetCategory); }
        }
    } 
  };

  const updateCardCategory = async (card: any, newCategory: string) => {
      const newSettings = { ...card.settings, category: newCategory };
      const updatedCard = { ...card, settings: newSettings };
      if (card.type === 'generic-sheet') { setGenericWidgets(prev => prev.map(w => w.id === card.id ? updatedCard : w)); await supabase.from('widgets').update({ settings: newSettings }).eq('id', card.id); } 
      else { setManualCards(prev => prev.map(c => c.id === card.id ? updatedCard : c)); await supabase.from('Weeks').update({ settings: newSettings }).eq('id', card.id); }
  };

  const addSection = async () => { 
      const name = prompt("New Section Name:"); 
      if (!name) return; 
      if (sections.includes(name)) return alert("Section already exists"); 
      
      const newSections = [...sections, name]; 
      setSections(newSections); 
      await supabase.rpc('update_dashboard_sections', { p_dashboard_id: dashboardId, p_sections: newSections });
  };
  
  // 🟢 DELETE SECTION (New)
  const deleteSection = async (sectionName: string) => {
      if(!confirm(`Delete section "${sectionName}"? Cards in this section will be moved to the top.`)) return;
      
      const newSections = sections.filter(s => s !== sectionName);
      setSections(newSections);
      
      // Save List
      await supabase.rpc('update_dashboard_sections', { p_dashboard_id: dashboardId, p_sections: newSections });
      
      // Move cards to safe zone (First available section or Planning)
      const safeZone = newSections[0] || "Planning & Resources";
      await supabase.rpc('delete_dashboard_section_logic', { p_dashboard_id: dashboardId, p_section_to_delete: sectionName, p_safe_section: safeZone });
      
      // Reload to see moved cards
      window.location.reload();
  };

  const renameSection = async (oldName: string, type: 'custom' | 'schedule' | 'missions') => {
      const newName = prompt("Rename Section:", oldName); 
      if (!newName || newName === oldName) return;
      
      let newSettings = { ...config.settings };
      if (type === 'custom') { 
          const newSections = sections.map(s => s === oldName ? newName : s); 
          setSections(newSections); 
          setManualCards(prev => prev.map(c => c.settings?.category === oldName ? { ...c, settings: { ...c.settings, category: newName } } : c)); 
          setGenericWidgets(prev => prev.map(c => c.settings?.category === oldName ? { ...c, settings: { ...c.settings, category: newName } } : c));
          
          await supabase.rpc('update_dashboard_sections', { p_dashboard_id: dashboardId, p_sections: newSections });
          await supabase.rpc('rename_dashboard_section_logic', { p_dashboard_id: dashboardId, p_old_name: oldName, p_new_name: newName });
      } 
      else if (type === 'schedule') { setScheduleTitle(newName); newSettings.scheduleTitle = newName; await supabase.from('dashboards').update({ settings: newSettings }).eq('id', dashboardId); }
      else if (type === 'missions') { setMissionsTitle(newName); newSettings.missionsTitle = newName; await supabase.from('dashboards').update({ settings: newSettings }).eq('id', dashboardId); }
  };

  const doesCardMatch = (card: any) => { if(!searchQuery) return true; return JSON.stringify(card).toLowerCase().includes(searchQuery.toLowerCase()); };
  const updateColor = async (newColor: string) => { if (!activeCard || !activeCard.source?.includes("manual")) return; const updatedCard = { ...activeCard, color: newColor }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ color: newColor }).eq('id', activeCard.id); };
  
  const handleOpenPicker = (bIdx: number) => { setActiveBlockIndex(bIdx); openPicker({ clientId: GOOGLE_CLIENT_ID, developerKey: GOOGLE_API_KEY, viewId: "DOCS", showUploadView: true, showUploadFolders: true, supportDrives: true, multiselect: true, callbackFunction: (data: any) => { if (data.action === "picked") addFilesToBlock(bIdx, data.docs); } }); };
  const addFilesToBlock = async (bIdx: number, files: any[]) => { const currentBlocks = getBlocks(activeCard); const newItems = files.map(file => ({ title: file.name, url: file.url, type: 'google-drive', iconUrl: file.iconUrl })); currentBlocks[bIdx].items = [...currentBlocks[bIdx].items, ...newItems]; updateResources(currentBlocks); };
  const getBlocks = (card: any) => { const res = card.resources || []; if (res.length === 0) return []; if (!res[0].items) return [{ title: "General Files", items: res }]; return res; };
  const addBlock = async () => { const newBlockName = prompt("Name your new Category:"); if (!newBlockName) return; updateResources([...getBlocks(activeCard), { title: newBlockName, items: [] }]); };
  const deleteBlock = async (bIdx: number) => { if(!confirm("Delete block?")) return; updateResources(getBlocks(activeCard).filter((_: any, idx: number) => idx !== bIdx)); };
  const addItemToBlock = async (bIdx: number) => { const titleInput = newItemTitleRefs.current[`block-${bIdx}`]; const urlInput = newItemUrlRefs.current[`block-${bIdx}`]; if (!titleInput?.value || !urlInput?.value) return alert("Enter info"); const currentBlocks = getBlocks(activeCard); currentBlocks[bIdx].items.push({ title: titleInput.value, url: urlInput.value, type: 'link' }); updateResources(currentBlocks); titleInput.value = ""; urlInput.value = ""; };
  const deleteItemFromBlock = async (bIdx: number, iIdx: number) => { if(!confirm("Remove file?")) return; const currentBlocks = getBlocks(activeCard); currentBlocks[bIdx].items = currentBlocks[bIdx].items.filter((_: any, idx: number) => idx !== iIdx); updateResources(currentBlocks); };
  const updateResources = async (newBlocks: any[]) => { const updatedCard = { ...activeCard, resources: newBlocks }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ resources: newBlocks }).eq('id', activeCard.id); };
  const handleSave = async () => { if (!activeCard || activeCard.source?.includes("sheet")) return; const newTitle = titleRef.current?.innerText || activeCard.title; const updated = { ...activeCard, title: newTitle }; setManualCards(manualCards.map(c => c.id === activeCard.id ? updated : c)); setActiveCard(updated); await supabase.from('Weeks').update({ title: newTitle }).eq('id', activeCard.id); };
  
  const setActiveModal = (card: any) => { 
      if (isEditing && activeCard) handleSave(); setIsEditing(false); setIsMapping(false); 
      if (card && card.settings?.connectedSheet && !card.data) { loadSheetData(card.settings.connectedSheet, card); } else { setActiveCard(card); }
      setShowDocPreview(null); 
  };
  const toggleEditMode = () => { if(isEditing) handleSave(); setIsEditing(!isEditing); }
  const getBgColor = (c: string) => COLOR_MAP[c] || "bg-slate-700";
  const isGoogleDoc = (url: string) => url.includes("docs.google.com") || url.includes("drive.google.com");
  const getEmbedUrl = (url: string) => { if(url.includes("/document/d/")) return url.replace("/edit", "/preview"); if(url.includes("/spreadsheets/d/")) return url.replace("/edit", "/preview"); if(url.includes("/presentation/d/")) return url.replace("/edit", "/preview"); return url; };
  const getFileIcon = (item: any) => { if (item.iconUrl) return <img src={item.iconUrl} className="w-5 h-5" alt="icon" />; const title = item.title.toLowerCase(); let iconClass = "fas fa-link text-slate-400"; if (title.includes("calendar")) iconClass = "fas fa-calendar-alt text-emerald-500"; else if (title.includes("plan") || title.includes("strategy")) iconClass = "fas fa-map text-blue-500"; else if (title.includes("offering")) iconClass = "fas fa-hand-holding-heart text-green-500"; else if (isGoogleDoc(item.url)) iconClass = "fab fa-google-drive text-slate-500"; return <i className={`${iconClass} text-lg`}></i>; };
  const isCardEditable = (card: any) => card && card.source === 'manual';
  
  const findAttachedSheet = () => { if (!activeCard?.resources) return null; for (const block of activeCard.resources) { const sheet = block.items?.find((i:any) => i.url.includes('spreadsheets')); if (sheet) return sheet.url; } return null; };
  const attachedSheetUrl = findAttachedSheet();

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  const weeklyScheduleItems = [ ...scheduleCards, ...manualCards.filter(c => c.settings?.category === "Weekly Schedule"), ...genericWidgets.filter(c => c.settings?.category === "Weekly Schedule") ];
  const missionSectionItems = [ missionCard, ...manualCards.filter(c => c.settings?.category === "Missions"), ...genericWidgets.filter(c => c.settings?.category === "Missions") ].filter(Boolean);

  return (
    <div className="pb-20 min-h-screen bg-slate-50/50">
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
                <button onClick={() => addNewCard(sections[0])} className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white transition-colors shadow-sm"><i className="fas fa-plus"></i><span>New Card</span></button>
                <button onClick={() => setShowTutorial(true)} className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700"><i className="fas fa-question text-sm"></i></button>
                <div className="h-6 w-px bg-slate-700 mx-1"></div> 
                <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            
            {/* 1. WEEKLY SCHEDULE */}
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => renameSection(scheduleTitle, 'schedule')}>
                        <i className="fas fa-calendar-alt"></i> {scheduleTitle} <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>
                    </div>
                    <button onClick={() => addNewCard("Weekly Schedule")} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add</button>
                </div>
                <SortableContext items={weeklyScheduleItems} strategy={rectSortingStrategy} id="Weekly Schedule">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px] border-2 border-transparent hover:border-slate-200/50 border-dashed rounded-xl transition-all">
                        {weeklyScheduleItems.filter(doesCardMatch).map((card) => (
                            <SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} variant="horizontal" />
                        ))}
                    </div>
                </SortableContext>
            </div>

            {/* 2. MISSIONS */}
            {missionSectionItems.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => renameSection(missionsTitle, 'missions')}>
                            <i className="fas fa-plane-departure"></i> {missionsTitle} <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>
                        </div>
                        <button onClick={() => addNewCard("Missions")} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add</button>
                    </div>
                    <SortableContext items={missionSectionItems} strategy={rectSortingStrategy} id="Missions">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px] border-2 border-transparent hover:border-slate-200/50 border-dashed rounded-xl transition-all">
                            {missionSectionItems.filter(doesCardMatch).map((card) => (
                                <SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} variant={card.id === 'missions-status' ? 'mission' : 'vertical'} />
                            ))}
                        </div>
                    </SortableContext>
                </div>
            )}

            {/* 3. DYNAMIC CUSTOM SECTIONS */}
            {sections.map((section) => {
                const sectionCards = [...manualCards, ...genericWidgets].filter(c => {
                    const cat = c.settings?.category || sections[0]; 
                    return cat === section;
                }).filter(doesCardMatch);

                return (
                    <div key={section} className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                {/* Rename Click */}
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => renameSection(section, 'custom')}>
                                    <i className="fas fa-layer-group"></i> {section} <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>
                                </div>
                                {/* 🔴 DELETE BUTTON (New) */}
                                <button onClick={() => deleteSection(section)} className="text-slate-300 hover:text-red-500 transition-colors text-xs" title="Delete Section">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                            <button onClick={() => addNewCard(section)} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add Card</button>
                        </div>
                        <SortableContext items={sectionCards} strategy={rectSortingStrategy} id={section}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px] rounded-xl border-2 border-dashed border-slate-200/50 p-2 transition-colors hover:border-blue-200/50">
                                {sectionCards.map((card) => ( <SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} /> ))}
                                {sectionCards.length === 0 && ( <div className="col-span-full flex items-center justify-center text-slate-300 text-sm font-medium italic h-24">Drop cards here</div> )}
                            </div>
                        </SortableContext>
                    </div>
                );
            })}
             <DragOverlay>
                {activeDragItem ? (
                     <div className={`rounded-2xl p-6 text-white flex flex-col items-center justify-center text-center h-40 shadow-2xl scale-105 ${getBgColor(activeDragItem.color || 'rose')}`}>
                        <h4 className="font-bold text-xl tracking-wide">{activeDragItem.title}</h4>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>

        <div className="pt-8 border-t border-slate-200 text-center">
            <button onClick={addSection} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors"><i className="fas fa-plus"></i> Add New Section</button>
        </div>
      </main>

      {/* --- MODAL --- */}
      {activeCard && (
        <div onClick={() => setActiveModal(null)} className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-6 bg-slate-900/70 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className={`bg-white w-full ${showDocPreview || activeCard.type === 'generic-sheet' || activeCard.settings?.viewMode ? "max-w-6xl h-[85vh]" : "max-w-2xl"} rounded-2xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300`}>
            <div className={`${getBgColor(activeCard.color || 'rose')} p-6 flex justify-between items-center text-white shrink-0 transition-colors`}>
              <div>
                 <h3 ref={titleRef} contentEditable={isEditing} suppressContentEditableWarning={true} className={`text-2xl font-bold outline-none ${isEditing ? 'border-b-2 border-white/50 bg-white/10 px-2 rounded cursor-text' : ''}`}>{activeCard.title}</h3>
                 
                 {isEditing && isCardEditable(activeCard) && (
                   <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                     <div className="flex gap-2">
                        {Object.keys(COLOR_MAP).map((c) => (
                          <button key={c} onClick={(e) => { e.stopPropagation(); updateColor(c); }} className={`w-6 h-6 rounded-full border-2 border-white/40 hover:scale-110 transition-transform shadow-sm ${COLOR_MAP[c]} ${activeCard.color === c ? 'ring-2 ring-white scale-110' : ''}`} title={`Change to ${c}`} />
                        ))}
                     </div>
                     <div className="flex gap-2 flex-wrap">
                        {ICON_OPTIONS.map((icon) => (
                            <button key={icon} onClick={() => updateIcon(icon)} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeCard.settings?.icon === icon ? 'bg-white text-slate-900 border-white' : 'bg-white/20 text-white border-transparent hover:bg-white/40'}`}>
                                <i className={`fas ${icon}`}></i>
                            </button>
                        ))}
                     </div>
                   </div>
                 )}
                 {showDocPreview && <div className="text-xs opacity-75">Document Preview</div>}
              </div>
              <div className="flex items-center gap-3">
                 {(activeCard.type === 'generic-sheet' || attachedSheetUrl || activeCard.data) && !isMapping && (
                    <button onClick={() => { if (attachedSheetUrl && !activeCard.data) { loadSheetData(attachedSheetUrl, activeCard); } setIsMapping(true); }} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm border ${activeCard.settings?.viewMode ? "bg-white text-slate-700 border-white/50 hover:bg-slate-100" : "bg-purple-600 text-white border-purple-500 hover:bg-purple-500 animate-pulse"}`}>
                      <i className={`fas ${activeCard.settings?.viewMode ? 'fa-sliders-h' : 'fa-magic'}`}></i> {activeCard.settings?.viewMode ? "Customize View" : "Visualize Data"}
                    </button>
                 )}
                 {(showDocPreview || activeCard.sheet_url || activeCard.source?.includes("sheet")) && (
                    <a href={showDocPreview ? showDocPreview.replace("/preview", "/edit") : activeCard.sheet_url || activeCard.sheet_url_schedule} target="_blank" rel="noreferrer" className="px-3 py-1 rounded text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200 flex items-center gap-2"><i className="fas fa-external-link-alt"></i> <span className="hidden sm:inline">Open in {activeCard.source?.includes("sheet") || activeCard.type === 'generic-sheet' ? "Sheets" : "Docs"}</span></a>
                 )}
                 {!showDocPreview && isCardEditable(activeCard) && (<button onClick={toggleEditMode} className={`px-3 py-1 rounded text-sm font-medium transition-colors border ${isEditing ? 'bg-white text-slate-900 border-white' : 'bg-black/20 text-white border-transparent hover:bg-black/40'}`}><i className={`fas ${isEditing ? 'fa-check' : 'fa-pen'} mr-2`}></i>{isEditing ? "Done" : "Edit Card"}</button>)}
                 {!showDocPreview && (isCardEditable(activeCard) || activeCard.type === 'generic-sheet') && (<button onClick={() => deleteCard(activeCard)} className="bg-red-500 px-3 py-1 rounded text-sm font-bold hover:bg-red-600 transition-colors text-white" title="Delete Card"><i className="fas fa-trash"></i></button>)}
                 {showDocPreview && <button onClick={() => setShowDocPreview(null)} className="bg-white/20 px-3 py-1 rounded text-sm font-medium"><i className="fas fa-arrow-left mr-2"></i> Back</button>}
                 <button onClick={() => setActiveModal(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><i className="fas fa-times text-xl"></i></button>
              </div>
            </div>
            
            <div className="p-0 overflow-y-auto custom-scroll flex flex-col h-full bg-slate-50">
              {(activeCard.type === 'generic-sheet' || activeCard.data) ? (
                  isMapping ? (
                      <div className="flex h-full">
                        <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
                          <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-magic text-purple-500"></i> Configure View</h2><p className="text-slate-500 text-xs mt-1">Map columns to the card. (Auto-CSV is enabled)</p></div>
                          <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Display Style</label><div className="grid grid-cols-2 gap-2"><button onClick={() => { const updated = { ...activeCard, settings: { ...activeCard.settings, viewMode: 'table' } }; setActiveCard(updated); }} className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${activeCard.settings?.viewMode === 'table' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><i className="fas fa-table text-lg"></i> Table List</button><button onClick={() => { const updated = { ...activeCard, settings: { ...activeCard.settings, viewMode: 'card' } }; setActiveCard(updated); }} className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${activeCard.settings?.viewMode === 'card' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><i className="fas fa-th-large text-lg"></i> Card Grid</button></div></div>
                            <div className="h-px bg-slate-100 w-full my-2"></div>
                            <div className="space-y-4">
                              <div><label className="block text-xs font-bold text-slate-700 mb-1">Title <span className="text-red-400">*</span></label><select id="titleCol" value={activeCard.settings?.titleCol || ''} onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, titleCol: e.target.value } })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"><option value="">-- Select Column --</option>{activeCard.columns?.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                              <div><label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Date</label><select id="subtitleCol" value={activeCard.settings?.subtitleCol || ''} onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, subtitleCol: e.target.value } })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"><option value="">-- None --</option>{activeCard.columns?.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                              <div><label className="block text-xs font-bold text-slate-700 mb-1">Status Tag</label><select id="tagCol" value={activeCard.settings?.tagCol || ''} onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, tagCol: e.target.value } })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"><option value="">-- None --</option>{activeCard.columns?.map((c:string) => <option key={c} value={c}>{c}</option>)}</select></div>
                              <div><label className="block text-xs font-bold text-slate-700 mb-2">Extra Details</label><div className="space-y-2">{activeCard.settings?.extraFields?.map((field: string, idx: number) => (<div key={idx} className="flex gap-2"><select value={field} onChange={(e) => { const newFields = [...(activeCard.settings.extraFields || [])]; newFields[idx] = e.target.value; setActiveCard({...activeCard, settings: {...activeCard.settings, extraFields: newFields}}); }} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm">{activeCard.columns?.map((c:string) => <option key={c} value={c}>{c}</option>)}</select><button onClick={() => { const newFields = activeCard.settings.extraFields.filter((_:any, i:number) => i !== idx); setActiveCard({...activeCard, settings: {...activeCard.settings, extraFields: newFields}}); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button></div>))}<button onClick={() => { const current = activeCard.settings.extraFields || []; const defaultCol = activeCard.columns?.[0] || ""; setActiveCard({...activeCard, settings: {...activeCard.settings, extraFields: [...current, defaultCol]}}); }} className="text-xs font-bold text-blue-600 hover:underline">+ Add Field</button></div></div>
                            </div>
                          </div>
                          <div className="p-6 border-t border-slate-200 bg-slate-50"><button onClick={() => saveMapping(activeCard.settings)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm mb-3 flex items-center justify-center gap-2"><i className="fas fa-check"></i> Save Configuration</button><button onClick={() => setIsMapping(false)} className="w-full text-slate-500 text-sm font-medium hover:text-slate-800">Cancel</button></div>
                        </div>
                        <div className="flex-1 bg-slate-100/50 flex flex-col">
                          <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</div>
                          <div className="flex-1 p-10 flex items-center justify-center overflow-y-auto">
                            <div className="w-full max-w-md pointer-events-none select-none">
                              {activeCard.settings?.viewMode === 'card' ? (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl scale-110 origin-center">
                                  <div className="flex justify-between items-start mb-4"><div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{activeCard.settings?.titleCol || "Select Title"}</div><h4 className="font-bold text-xl text-slate-800 line-clamp-2">{activeCard.data[0]?.[activeCard.settings?.titleCol] || "Sample Value"}</h4></div>{activeCard.settings?.tagCol && activeCard.data[0]?.[activeCard.settings?.tagCol] && (<span className="shrink-0 ml-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">{activeCard.data[0][activeCard.settings.tagCol]}</span>)}</div>
                                  <div className="space-y-3">{activeCard.settings?.subtitleCol && (<div><div className="text-[10px] font-bold text-slate-400 uppercase">{activeCard.settings.subtitleCol}</div><div className="text-sm text-slate-600 font-medium">{activeCard.data[0]?.[activeCard.settings?.subtitleCol] || "Sample Subtitle"}</div></div>)}{activeCard.settings?.extraFields?.map((f: string) => (<div key={f}><div className="text-[10px] font-bold text-slate-400 uppercase">{f}</div><div className="text-sm text-slate-600 font-medium">{activeCard.data[0]?.[f] || "-"}</div></div>))}</div>
                                </div>
                              ) : (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"><div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex gap-4"><div className="h-2 bg-slate-200 rounded w-16"></div><div className="h-2 bg-slate-200 rounded w-16"></div><div className="h-2 bg-slate-200 rounded w-16"></div></div><div className="p-4 space-y-4">{[1,2,3].map(i => (<div key={i} className="flex gap-4 items-center"><div className="h-3 bg-slate-800 rounded w-1/3 opacity-80"></div><div className="h-3 bg-slate-200 rounded w-1/4"></div><div className="h-3 bg-emerald-100 rounded w-1/5"></div></div>))}</div></div>
                              )}
                              <div className="mt-8 text-center text-slate-400 text-xs">{activeCard.settings?.viewMode === 'card' ? "Card Grid Preview" : "Table List Preview"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                  ) : activeCard.settings?.viewMode === 'card' ? (
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {activeCard.data.filter((row:any) => row[activeCard.settings.titleCol]).map((row:any, idx:number) => (
                               <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                   <div className="flex justify-between items-start mb-4"><div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{activeCard.settings.titleCol}</div><h4 className="font-bold text-xl text-slate-800 line-clamp-2">{row[activeCard.settings.titleCol] || "Untitled"}</h4></div>{activeCard.settings.tagCol && row[activeCard.settings.tagCol] && (<span className="shrink-0 ml-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">{row[activeCard.settings.tagCol]}</span>)}</div>
                                   <div className="space-y-3">{activeCard.settings.subtitleCol && (<div><div className="text-[10px] font-bold text-slate-400 uppercase">{activeCard.settings.subtitleCol}</div><div className="text-sm text-slate-600 font-medium">{row[activeCard.settings.subtitleCol]}</div></div>)}{activeCard.settings.extraFields?.map((f: string) => (<div key={f}><div className="text-[10px] font-bold text-slate-400 uppercase">{f}</div><div className="text-sm text-slate-600 font-medium">{renderCellContent(row[f])}</div></div>))}</div>
                               </div>
                           ))}
                      </div>
                  ) : (
                      <div className="flex flex-col h-full bg-slate-50">
                         <div className="px-8 py-4 border-b border-slate-200 bg-white flex justify-between items-center"><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Source: Google Sheet</div><div className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-mono">{activeCard.rowCount} Rows</div></div>
                         <div className="flex-1 overflow-auto p-8 custom-scroll"><div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50 sticky top-0 z-10 shadow-sm"><tr>{activeCard.columns?.map((col:string, idx:number) => (<th key={idx} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50">{col}</th>))}</tr></thead><tbody className="bg-white divide-y divide-slate-200">{activeCard.data.map((row:any, rIdx:number) => (<tr key={rIdx} className="hover:bg-blue-50/50 transition-colors group">{activeCard.columns?.map((col:string, cIdx:number) => (<td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm">{renderCellContent(row[col])}</td>))}</tr>))}</tbody></table></div></div>
                      </div>
                  )
              ) : activeCard.id === "missions-status" ? (
                  <div className="p-0 bg-slate-50 min-h-full">
                      <div className="bg-sky-50 p-8 border-b border-sky-100 flex flex-col md:flex-row justify-between items-center gap-6"><div><div className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">Upcoming Departure</div><h2 className="text-3xl font-bold text-slate-800 mb-1">{activeCard.upcomingLoc} Team</h2><div className="flex items-center gap-2 text-slate-500"><i className="far fa-calendar-alt"></i> {activeCard.upcomingDate}</div></div><div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-sky-100 text-center min-w-[120px]"><div className="text-4xl font-bold text-sky-600">{activeCard.upcomingOpen}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Spots</div></div></div>
                      <div className="p-8"><div className="flex items-center gap-2 mb-4"><i className="fas fa-ticket-alt text-slate-400"></i><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Open Registrations</h4></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{activeCard.trips.map((trip: any, idx: number) => (<div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"><div><div className="font-bold text-slate-800 text-lg">{trip.name}</div><div className="text-xs text-slate-400 mt-1">Registration Open</div></div><div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{trip.spots} Spots</div></div>))}</div></div>
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
                <div className="p-8 space-y-8">
                     {activeCard.scripture && <div><div className="flex items-center gap-2 mb-3"><i className="fas fa-book-open text-rose-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Primary Text</span></div><div className="text-lg text-slate-800 whitespace-pre-wrap">{activeCard.scripture}</div></div>}
                     {activeCard.worship && <div className="border-t border-slate-200 pt-6"><div className="flex items-center gap-2 mb-3"><i className="fas fa-music text-purple-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Worship</span></div><div className="text-slate-700 whitespace-pre-wrap pl-4 border-l-4 border-purple-200 py-1">{activeCard.worship}</div></div>}
                     {activeCard.response_song && <div className="mt-2 ml-4"><div className="bg-purple-50 text-purple-900 p-3 rounded-md text-sm italic border border-purple-100 shadow-sm">{activeCard.response_song}</div></div>}
                </div>
              ) : (
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

      {/* 🆕 TUTORIAL MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center"><div><h3 className="text-xl font-bold text-slate-800">Quick Start Guide</h3></div><button onClick={() => setShowTutorial(false)}><i className="fas fa-times"></i></button></div>
            <div className="p-8 space-y-4"><div>Tip: Paste a Google Sheet link in the "New Widget" modal to instantly visualize it!</div></div>
          </div>
        </div>
      )}

      <DashboardChat contextData={{ title: config?.title }} />

    </div>
  );
}