"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import InviteModal from "@/components/InviteModal";
// 🟢 CHARTS IMPORTS
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

// 🔴 GOOGLE KEYS
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyCJFRHpqhRgmkqivrhaQ_bSMv7lZA7Gz5o";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "621954773836-k7vgf85fvrbai1n1cc1dncq7mrjhobfb.apps.googleusercontent.com";

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-600", blue: "bg-blue-600", green: "bg-emerald-600",
  grey: "bg-purple-600", orange: "bg-orange-600", teal: "bg-cyan-600", slate: "bg-slate-700",
};

const toCSVUrl = (url: string) => {
  if (!url) return "";

  // 1. Extract ID from any Google URL
  const match = url.match(/[-\w]{25,}/);
  const id = match ? match[0] : null;

  if (!id) return url;

  // 2. Force it into the specific CSV export format
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
};

// Helper to clean currency/text into numbers for charts
const cleanNumber = (val: any) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = val.toString().replace(/[$,\s]/g, '');
  return parseFloat(clean) || 0;
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { id: card.id, title: card.title, settings: card.settings, type: card.type }
  });

  const userIcon = card.settings?.icon;
  let defaultIcon = "fa-folder-open";
  if (variant === 'horizontal') defaultIcon = "fa-calendar-alt";
  if (variant === 'mission') defaultIcon = "fa-globe-americas";
  const displayIcon = userIcon || defaultIcon;

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.3 : 1 };

  const showMiniChart = card.settings?.viewMode === 'chart' &&
    card.data &&
    card.settings?.yAxisCol &&
    card.settings?.showOnDashboard;

  const miniChartData = useMemo(() => {
    if (!showMiniChart || !card.data) return [];
    return card.data.slice(0, 15).map((d: any) => ({
      ...d,
      [card.settings.yAxisCol]: cleanNumber(d[card.settings.yAxisCol])
    }));
  }, [card.data, card.settings?.yAxisCol, showMiniChart]);

  if (variant === 'mission') {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md rounded-xl p-5 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group bg-cyan-600`}>
        <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm"><i className={`fas ${displayIcon} text-2xl`}></i></div>
        <h4 className="font-bold text-lg tracking-wide">{card.title || "Untitled"}</h4>
        <div className="mt-3 text-[10px] uppercase tracking-widest bg-black/20 px-2 py-1 rounded">View Dashboard</div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md rounded-xl p-4 text-white flex flex-row items-center text-left h-24 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}>
        <div className="bg-white/20 h-12 w-12 rounded-full flex items-center justify-center mr-4 shrink-0 backdrop-blur-sm"><i className={`fas ${displayIcon} text-xl`}></i></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg leading-tight truncate">{card.title || "Untitled"}</h4>
          <div className="text-xs font-medium opacity-80 mt-1 truncate">{card.date_label || "No Date"}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(card)} className={`cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-lg rounded-2xl p-6 text-white flex flex-col items-center justify-center text-center h-40 relative overflow-hidden group ${getBgColor(card.color || 'rose')}`}>
      {showMiniChart ? (
        <div className="w-full h-full absolute inset-0 p-4 pt-10 opacity-90 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniChartData}>
              <Area type="monotone" dataKey={card.settings.yAxisCol} stroke="#fff" fill="rgba(255,255,255,0.3)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute top-4 left-0 w-full text-center text-xs font-bold uppercase opacity-80 truncate px-4">{card.title || "Untitled"}</div>
        </div>
      ) : (
        <>
          <div className="bg-white/16 p-1 rounded-full mb-4 backdrop-blur-sm"><i className={`fas ${displayIcon} text-3xl`}></i></div>
          <h4 className="font-bold text-xl tracking-wide line-clamp-2">{card.title || "Untitled"}</h4>
          <div className="mt-3 text-[10px] uppercase tracking-widest bg-white/20 px-2 py-1 rounded flex items-center gap-1">
            {card.settings?.viewMode === 'chart' ? (
              <><i className="fas fa-chart-pie"></i> Data View</>
            ) : (
              <><i className="fas fa-paperclip"></i> {card.resources ? card.resources.reduce((acc: any, block: any) => acc + (block.items?.length || 0), 0) : 0} Files</>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function DynamicDashboard() {
  const params = useParams();
  const dashboardId = params.id as string;
  const [canEdit, setCanEdit] = useState(false);

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
  const [addingLinkToBlock, setAddingLinkToBlock] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const newItemTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const newItemUrlRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [googleToken, setGoogleToken] = useState<string>("");

  useEffect(() => {
    if (!dashboardId) return;

    const initDashboard = async () => {
      setLoading(true);

      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Get Dashboard Config
      // We removed the dependency on 'user_id' from this table to stop the 400 Error
      const { data: dashConfig, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (error || !dashConfig) {
        console.error("Dashboard Load Error:", error);
        // Optional: You could adding a setLoading(false) here if you want to show an error state
        return;
      }

      // 3. 🟢 ROBUST PERMISSION CHECK
      // We determine permissions 100% from the 'dashboard_access' list now.
      let userCanEdit = false;

      if (user) {
        const { data: accessList } = await supabase
          .from('dashboard_access')
          .select('role, user_id, user_email')
          .eq('dashboard_id', dashboardId);

        if (accessList) {
          // Find MY permission row by matching EITHER my ID OR my Email
          // This fixes the bug where invited users (via email) were seen as "Viewers"
          const myPermission = accessList.find(row =>
            row.user_id === user.id ||
            (user.email && row.user_email?.toLowerCase() === user.email.toLowerCase())
          );

          if (myPermission) {
            const role = myPermission.role?.toLowerCase();
            // Grant edit access if I am 'owner', 'editor', or 'edit'
            if (['owner', 'editor', 'edit'].includes(role)) {
              userCanEdit = true;
              console.log(`✅ Access Granted: User is ${role}`);
            } else {
              console.log(`ℹ️ View Only: User is ${role}`);
            }
          } else {
            console.log("ℹ️ User not found in access list (View Only)");
          }
        }
      }

      setCanEdit(userCanEdit);

      // 4. Load the rest of the dashboard data (Keep existing logic)
      const { data: secureToken } = await supabase.rpc('get_or_create_invite_token', { p_dashboard_id: dashboardId });
      if (secureToken) {
        dashConfig.share_token = secureToken;
      }

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

      // 🟢 DEFINE HEADERS DYNAMICALLY
      const headers: any = {};
      if (googleToken) {
        headers.Authorization = `Bearer ${googleToken}`;
      }

      // 🟢 PASS THE HEADERS
      const response = await fetch(csvUrl, { headers });

      if (!response.ok) {
        console.warn(`Could not load sheet for ${card.title}: ${response.status}`);
        return;
      }
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(),
        complete: (results: any) => {
          const enrichedCard = { ...card, data: results.data, columns: results.meta.fields, rowCount: results.data.length, sheet_url: url, settings: { ...card.settings, connectedSheet: url } };
          setActiveCard(enrichedCard);
          setManualCards(prev => prev.map(c => c.id === card.id ? enrichedCard : c));
        }
      });
    } catch (e) { console.error("Failed to load sheet data", e); }
  };

  const fetchGenericWidgets = async () => {
    const { data: widgets } = await supabase.from('widgets').select('*').eq('dashboard_id', dashboardId);
    if (!widgets) return;
    const loadedWidgets: any[] = [];
    for (const widget of widgets) {
      try {
        const csvUrl = toCSVUrl(widget.sheet_url);
        const response = await fetch(csvUrl);
        if (response.ok) {
          const csvText = await response.text();
          Papa.parse(csvText, {
            header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(),
            complete: (results: any) => {
              const safeSettings = widget.settings || {};
              if (!safeSettings.category) { safeSettings.category = "Planning & Resources"; }
              loadedWidgets.push({
                id: widget.id,
                title: widget.title,
                type: 'generic-sheet',
                color: widget.color || 'blue',
                data: results.data,
                columns: results.meta.fields,
                rowCount: results.data.length,
                sheet_url: widget.sheet_url,
                settings: safeSettings
              });
            }
          });
        }
      } catch (e) { console.error("Error fetching widget", widget.title); }
    }
    setTimeout(() => setGenericWidgets(loadedWidgets), 500);
  };

  const fetchSheetData = async (currentConfig: any) => {
    if (currentConfig.sheet_url_schedule) {
      try {
        const response = await fetch(currentConfig.sheet_url_schedule);
        if (response.ok) {
          Papa.parse(await response.text(), {
            header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
              const cards = results.data.filter((row: any) => row["Week Label"]).map((row: any, index: number) => ({ id: `sheet1-${index}`, title: row["Week Label"], date_label: row["Date"] || "", scripture: row["Passage"] || "", worship: row["Song List"] || "", response_song: row["Response Song"] || "", offering: row["Offering"] || "", resources: [], color: row["Color"] ? row["Color"].toLowerCase() : "purple", source: "google-sheet", category: "Weekly Schedule" }));
              setScheduleCards(cards);
            }
          });
        }
      } catch (e) { console.error("Schedule Fetch Error", e); }
    }
    if (currentConfig.sheet_url_missions) {
      try {
        const response = await fetch(currentConfig.sheet_url_missions);
        if (response.ok) {
          Papa.parse(await response.text(), {
            header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(), complete: (results: any) => {
              const data = results.data;
              if (data.length > 0) {
                const row1 = data[0];
                setMissionCard({ id: 'missions-status', title: "Missions Status", totalNonStaff: row1["Total Non-Staff"], totalStaff: row1["Total Staff"], percentNonStaff: row1["% of Non-Staff on Tr"] || row1["% of Non-Staff on Trips"], percentStaff: row1["% of Staff on Trips"], totalOpen: row1["Open Spots"], upcomingLoc: data.find((r: any) => r["Detail"]?.includes("Location"))?.["Value"] || "TBD", upcomingDate: data.find((r: any) => r["Detail"]?.includes("Departure Date"))?.["Value"] || "TBD", upcomingOpen: data.find((r: any) => r["Detail"]?.includes("Open Spots"))?.["Value"] || "0", upcomingStatus: data.find((r: any) => r["Detail"]?.includes("Status"))?.["Value"] || "Open", trips: data.map((r: any) => ({ name: r[""] || r["Trip"] || Object.values(r)[5], spots: r["Open Spots_1"] || Object.values(r)[6] })).filter((t: any) => t.name && t.spots && t.name !== "Trip"), color: "teal", source: "missions-dashboard", category: "Missions" });
              }
            }
          });
        }
      } catch (e) { console.error("Missions Fetch Error", e); }
    }
  };

  const fetchManualCards = async () => {
    const { data } = await supabase.from('Weeks').select('*').eq('dashboard_id', dashboardId).order('sort_order', { ascending: true });
    if (data) setManualCards(data.map((item: any) => ({ ...item, source: 'manual' })));
  };

  const saveMapping = async (newSettings: any) => {
    const updatedModalCard = { ...activeCard, settings: newSettings };
    setActiveCard(updatedModalCard);

    // 🟢 UPDATED: Removed the 20-row limit. Now saves the full dataset.
    const cardForList = { ...updatedModalCard };

    // OPTIONAL: Only limit if it's massive (e.g. > 2000 rows) to prevent lag
    // if (cardForList.data && cardForList.data.length > 2000) { 
    //   cardForList.data = cardForList.data.slice(0, 2000); 
    // }

    if (activeCard.type === 'generic-sheet') {
      setGenericWidgets(prev => prev.map(w => w.id === activeCard.id ? cardForList : w));
      await supabase.from('widgets').update({ settings: newSettings }).eq('id', activeCard.id);
    } else {
      setManualCards(prev => prev.map(c => c.id === activeCard.id ? cardForList : c));
      await supabase.from('Weeks').update({ settings: newSettings }).eq('id', activeCard.id);
    }
    setIsMapping(false);
  };

  const deleteCard = async (card: any) => {
    if (!card || !card.id) return alert("Error: Card missing");
    if (!confirm("Delete this card permanently?")) return;

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

    if (card.type === 'generic-sheet') {
      setGenericWidgets(prev => prev.map(w => w.id === card.id ? updatedCard : w));
    } else {
      setManualCards(prev => prev.map(c => c.id === card.id ? updatedCard : c));
    }

    const type = card.type === 'generic-sheet' ? 'widget' : 'manual';
    const { error } = await supabase.rpc('move_dashboard_card', {
      p_card_id: card.id,
      p_new_category: newCategory,
      p_card_type: type
    });

    if (error) { console.error("Move failed:", error); alert("Could not save move. Check console."); }
  };

  const addSection = async () => {
    const name = prompt("New Section Name:");
    if (!name) return;
    if (sections.includes(name)) return alert("Section already exists");

    const newSections = [...sections, name];
    setSections(newSections);
    await supabase.rpc('update_dashboard_sections', { p_dashboard_id: dashboardId, p_sections: newSections });
  };

  const deleteSection = async (sectionName: string) => {
    if (!confirm(`Delete section "${sectionName}"? Cards in this section will be moved to the top.`)) return;

    const newSections = sections.filter(s => s !== sectionName);
    setSections(newSections);

    await supabase.rpc('update_dashboard_sections', { p_dashboard_id: dashboardId, p_sections: newSections });
    const safeZone = newSections[0] || "Planning & Resources";
    await supabase.rpc('delete_dashboard_section_logic', { p_dashboard_id: dashboardId, p_section_to_delete: sectionName, p_safe_section: safeZone });

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

  const doesCardMatch = (card: any) => { if (!searchQuery) return true; return JSON.stringify(card).toLowerCase().includes(searchQuery.toLowerCase()); };
  const updateColor = async (newColor: string) => { if (!activeCard || !activeCard.source?.includes("manual")) return; const updatedCard = { ...activeCard, color: newColor }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ color: newColor }).eq('id', activeCard.id); };

  const handleOpenPicker = (bIdx: number) => {
    setActiveBlockIndex(bIdx);
    openPicker({
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_API_KEY,
      viewId: "DOCS",

      // 🟢 ADD THIS LINE TO SAVE $4,500/YEAR:
      // This limits access ONLY to files the user selects.
      // It is classified as "Non-Sensitive" or "Recommended" by Google.
      customScopes: ['https://www.googleapis.com/auth/drive.file'],

      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // inside handleOpenPicker...
      callbackFunction: (data: any) => {
        if (data.action === "picked") {
          // 🟢 SAVE THE TOKEN HERE:
          if (data.oauthToken) {
            setGoogleToken(data.oauthToken);
          }
          addFilesToBlock(bIdx, data.docs);
        }
      }
    });
  };
  const addFilesToBlock = async (bIdx: number, files: any[]) => {
    const currentBlocks = getBlocks(activeCard);

    // 1. Map the data
    const newItems = files.map(file => ({
      title: file.name,
      url: file.url,
      type: 'google-drive',
      iconUrl: file.iconUrl,
      mimeType: file.mimeType,
      fileId: file.id
    }));

    // 2. Add to the list
    currentBlocks[bIdx].items = [...currentBlocks[bIdx].items, ...newItems];

    // 3. Save the list to Supabase
    await updateResources(currentBlocks);

    // 4. Auto-Detect Sheets
    const hasSheet = newItems.find(f => f.mimeType === "application/vnd.google-apps.spreadsheet");

    if (hasSheet) {
      const confirmChart = confirm(`You added "${hasSheet.title}". \n\nDo you want to visualize this data as a chart?`);
      if (confirmChart) {
        const updatedCard = {
          ...activeCard,
          resources: currentBlocks,
          sheet_url: hasSheet.url,
          settings: {
            ...activeCard.settings,
            viewMode: 'table',
            connectedSheet: hasSheet.url
          }
        };

        setActiveCard(updatedCard);
        setManualCards(prev => prev.map(c => c.id === activeCard.id ? updatedCard : c));

        await supabase.from('Weeks').update({
          settings: updatedCard.settings,
          sheet_url: hasSheet.url
        }).eq('id', activeCard.id);

        loadSheetData(hasSheet.url, updatedCard);
      }
    }
  };
  const getBlocks = (card: any) => { const res = card.resources || []; if (res.length === 0) return []; if (!res[0].items) return [{ title: "General Files", items: res }]; return res; };
  const addBlock = async () => { const newBlockName = prompt("Name your new Category:"); if (!newBlockName) return; updateResources([...getBlocks(activeCard), { title: newBlockName, items: [] }]); };
  const deleteBlock = async (bIdx: number) => { if (!confirm("Delete block?")) return; updateResources(getBlocks(activeCard).filter((_: any, idx: number) => idx !== bIdx)); };

  const addItemToBlock = async (bIdx: number) => {
    const titleInput = newItemTitleRefs.current[`block-${bIdx}`];
    const urlInput = newItemUrlRefs.current[`block-${bIdx}`];
    if (!titleInput?.value || !urlInput?.value) return alert("Enter info");
    const currentBlocks = getBlocks(activeCard);
    currentBlocks[bIdx].items.push({ title: titleInput.value, url: urlInput.value, type: 'link' });
    updateResources(currentBlocks);
    titleInput.value = "";
    urlInput.value = "";
    setAddingLinkToBlock(null);
  };

  const deleteItemFromBlock = async (bIdx: number, iIdx: number) => { if (!confirm("Remove file?")) return; const currentBlocks = getBlocks(activeCard); currentBlocks[bIdx].items = currentBlocks[bIdx].items.filter((_: any, idx: number) => idx !== iIdx); updateResources(currentBlocks); };
  const updateResources = async (newBlocks: any[]) => { const updatedCard = { ...activeCard, resources: newBlocks }; setActiveCard(updatedCard); setManualCards(manualCards.map(c => c.id === activeCard.id ? updatedCard : c)); await supabase.from('Weeks').update({ resources: newBlocks }).eq('id', activeCard.id); };
  const handleSave = async () => { if (!activeCard || activeCard.source?.includes("sheet")) return; const newTitle = titleRef.current?.innerText || activeCard.title; const updated = { ...activeCard, title: newTitle }; setManualCards(manualCards.map(c => c.id === activeCard.id ? updated : c)); setActiveCard(updated); await supabase.from('Weeks').update({ title: newTitle }).eq('id', activeCard.id); };

  const setActiveModal = (card: any) => {
    if (!card) {
      if (isEditing && activeCard) handleSave();
      setActiveCard(null);
      setIsEditing(false);
      setIsMapping(false);
      setAddingLinkToBlock(null);
      setShowDocPreview(null);
      return;
    }

    if (isEditing && activeCard) handleSave();
    setIsEditing(false);
    setIsMapping(false);
    setAddingLinkToBlock(null);

    const cardToLoad = { ...card };

    if (cardToLoad.source === 'manual') {
      if (cardToLoad.settings) {
        cardToLoad.settings = { ...cardToLoad.settings, viewMode: null };
      }
    } else {
      if (cardToLoad.settings?.connectedSheet && !cardToLoad.data) {
        loadSheetData(cardToLoad.settings.connectedSheet, cardToLoad);
      }
    }

    setActiveCard(cardToLoad);
    setShowDocPreview(null);
  };

  const toggleEditMode = () => { if (isEditing) handleSave(); setIsEditing(!isEditing); }
  const getBgColor = (c: string) => COLOR_MAP[c] || "bg-slate-700";
  const isGoogleDoc = (url: string) => url.includes("docs.google.com") || url.includes("drive.google.com");
  const getEmbedUrl = (url: string) => { if (url.includes("/document/d/")) return url.replace("/edit", "/preview"); if (url.includes("/spreadsheets/d/")) return url.replace("/edit", "/preview"); if (url.includes("/presentation/d/")) return url.replace("/edit", "/preview"); return url; };
  const getFileIcon = (item: any) => { if (item.iconUrl) return <img src={item.iconUrl} className="w-5 h-5" alt="icon" />; const title = item.title.toLowerCase(); let iconClass = "fas fa-link text-slate-400"; if (title.includes("calendar")) iconClass = "fas fa-calendar-alt text-emerald-500"; else if (title.includes("plan") || title.includes("strategy")) iconClass = "fas fa-map text-blue-500"; else if (title.includes("offering")) iconClass = "fas fa-hand-holding-heart text-green-500"; else if (isGoogleDoc(item.url)) iconClass = "fab fa-google-drive text-slate-500"; return <i className={`${iconClass} text-lg`}></i>; };
  const isCardEditable = (card: any) => card && card.source === 'manual';

  const findAttachedSheet = () => { if (!activeCard?.resources) return null; for (const block of activeCard.resources) { const sheet = block.items?.find((i: any) => i.url.includes('spreadsheets')); if (sheet) return sheet.url; } return null; };
  const attachedSheetUrl = findAttachedSheet();
  const handleFileClick = (item: any) => {
    // 🟢 FIX 2: Prevent Race Condition here too
    if (activeCard.settings?.connectedSheet === item.url) {

      const targetMode = activeCard.settings.chartType ? 'chart' : 'table';
      const updated = {
        ...activeCard,
        settings: { ...activeCard.settings, viewMode: targetMode }
      };

      setActiveCard(updated);

      // Pass 'updated' so data loader knows we want to keep viewMode='chart'
      loadSheetData(item.url, updated);
      return;
    }

    if (isGoogleDoc(item.url)) {
      setShowDocPreview(getEmbedUrl(item.url));
    } else {
      window.open(item.url, '_blank');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  const weeklyScheduleItems = [...scheduleCards, ...manualCards.filter(c => c.settings?.category === "Weekly Schedule"), ...genericWidgets.filter(c => c.settings?.category === "Weekly Schedule")];
  const missionSectionItems = [missionCard, ...manualCards.filter(c => c.settings?.category === "Missions"), ...genericWidgets.filter(c => c.settings?.category === "Missions")].filter(Boolean);

  return (
    <div className="pb-20 min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors mr-2" title="Back">
                  <i className="fas fa-arrow-left"></i>
                </Link>
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                  {config?.title ? config.title.substring(0, 2).toUpperCase() : 'DB'}
                </div>
                <span className="font-semibold text-lg tracking-tight hidden md:block text-white">
                  {config?.title || "Loading..."}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="find a document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-48 md:w-64 transition-all"
                />
              </div>

              {canEdit && (
                <button
                  onClick={() => addNewCard(sections[0])}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white transition-all shadow-sm hover:shadow-blue-500/20"
                >
                  <i className="fas fa-plus"></i>
                  <span>New Card</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md bg-purple-600 border border-purple-500 hover:bg-purple-500 text-white transition-colors shadow-sm"
              >
                <i className="fas fa-user-plus"></i>
                <span>Invite</span>
              </button>

              <button
                onClick={() => setShowTutorial(true)}
                className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700"
                title="Help & Tutorial"
              >
                <i className="fas fa-question text-sm"></i>
              </button>

              <button
                onClick={() => window.location.href = '/account'}
                className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700"
                title="Account Settings"
              >
                <i className="fas fa-user-cog text-sm"></i>
              </button>

              <div className="h-6 w-px bg-slate-700 mx-1"></div>

              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        <DndContext
          sensors={canEdit ? sensors : []}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >

          {/* 1. WEEKLY SCHEDULE */}
          {scheduleCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div
                  className={`flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 transition-colors ${canEdit ? "cursor-pointer hover:text-blue-500" : "cursor-default"}`}
                  onClick={() => canEdit && renameSection(scheduleTitle, 'schedule')}
                >
                  <i className="fas fa-calendar-alt"></i> {scheduleTitle}
                  {canEdit && <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>}
                </div>
                {canEdit && <button onClick={() => addNewCard("Weekly Schedule")} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add</button>}
              </div>
              <SortableContext items={weeklyScheduleItems} strategy={rectSortingStrategy} id="Weekly Schedule">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px] border-2 border-transparent hover:border-slate-200/50 border-dashed rounded-xl transition-all">
                  {weeklyScheduleItems.filter(doesCardMatch).map((card) => (
                    <SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} variant="horizontal" />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* 2. MISSIONS */}
          {missionSectionItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div
                  className={`flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 transition-colors ${canEdit ? "cursor-pointer hover:text-blue-500" : ""}`}
                  onClick={() => canEdit && renameSection(missionsTitle, 'missions')}
                >
                  <i className="fas fa-plane-departure"></i> {missionsTitle}
                  {canEdit && <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>}
                </div>
                {canEdit && <button onClick={() => addNewCard("Missions")} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add</button>}
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
              const cat = c.settings?.category || "Planning & Resources";
              return cat === section;
            }).filter(doesCardMatch);

            return (
              <div key={section} className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pl-1 transition-colors ${canEdit ? "cursor-pointer hover:text-blue-500" : ""}`}
                      onClick={() => canEdit && renameSection(section, 'custom')}
                    >
                      <i className="fas fa-layer-group"></i> {section}
                      {canEdit && <i className="fas fa-pen opacity-0 group-hover:opacity-100 ml-2"></i>}
                    </div>
                    {canEdit && (
                      <button onClick={() => deleteSection(section)} className="text-slate-300 hover:text-red-500 transition-colors text-xs" title="Delete Section">
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  {canEdit && <button onClick={() => addNewCard(section)} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-opacity">+ Add Card</button>}
                </div>
                <SortableContext items={sectionCards} strategy={rectSortingStrategy} id={section}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[100px] rounded-xl border-2 border-dashed border-transparent p-2 transition-colors hover:border-slate-200/20">
                    {sectionCards.map((card) => (<SortableCard key={card.id} card={card} onClick={setActiveModal} getBgColor={getBgColor} />))}
                    {sectionCards.length === 0 && (<div className="col-span-full flex items-center justify-center text-slate-300 text-sm font-medium italic h-24">Drop cards here</div>)}
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
          {canEdit && (
            <button onClick={addSection} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors"><i className="fas fa-plus"></i> Add New Section</button>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      {activeCard && (
        <div onClick={() => setActiveModal(null)} className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-6 bg-slate-900/70 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className={`bg-white w-full ${showDocPreview || activeCard.type === 'generic-sheet' || activeCard.settings?.viewMode ? "max-w-6xl h-[85vh]" : "max-w-2xl"} rounded-2xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className={`${getBgColor(activeCard.color || 'rose')} p-6 flex justify-between items-center text-white shrink-0 transition-colors`}>
              <div>
                <h3
                  ref={titleRef}
                  contentEditable={isEditing && canEdit}
                  suppressContentEditableWarning={true}
                  className={`text-2xl font-bold outline-none ${isEditing && canEdit ? 'border-b-2 border-white/50 bg-white/10 px-2 rounded cursor-text' : ''}`}
                >
                  {activeCard.title}
                </h3>
                {isEditing && isCardEditable(activeCard) && canEdit && (
                  <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    {Object.keys(COLOR_MAP).map((c) => (
                      <button
                        key={c}
                        onClick={(e) => { e.stopPropagation(); updateColor(c); }}
                        className={`w-6 h-6 rounded-full border-2 border-white/40 hover:scale-110 transition-transform shadow-sm ${COLOR_MAP[c]} ${activeCard.color === c ? 'ring-2 ring-white scale-110' : ''}`}
                        title={`Change to ${c}`}
                      />
                    ))}
                  </div>
                )}
                {showDocPreview && <div className="text-xs opacity-75">Document Preview</div>}
              </div>
              <div className="flex items-center gap-3">
                {/* 🟢 TOGGLE FILES / VISUALIZATION - FIXED RACE CONDITION */}
                {(activeCard.type === 'generic-sheet' || attachedSheetUrl || activeCard.data) && !isMapping && (
                  <button
                    onClick={() => {
                      if (activeCard.settings?.viewMode) {
                        const updated = { ...activeCard, settings: { ...activeCard.settings, viewMode: null } };
                        setActiveCard(updated);
                      }
                      else {
                        // 🟢 FIX: Create updated state AND pass it to the loader
                        const updated = { ...activeCard, settings: { ...activeCard.settings, viewMode: 'card' } };
                        setActiveCard(updated);

                        if (attachedSheetUrl && !activeCard.data) {
                          // Pass 'updated' to avoid race condition where loading data resets the viewMode
                          loadSheetData(attachedSheetUrl, updated);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm border ${activeCard.settings?.viewMode
                      ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      : "bg-purple-600 text-white border-purple-500 hover:bg-purple-50 animate-pulse"
                      }`}
                  >
                    <i className={`fas ${activeCard.settings?.viewMode ? 'fa-folder-open' : 'fa-chart-pie'}`}></i>
                    {activeCard.settings?.viewMode ? "Back to Files" : "Visualize Data"}
                  </button>
                )}

                {activeCard.settings?.viewMode && (
                  <button
                    onClick={() => setIsMapping(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm ${!canEdit ? 'hidden' : ''}`}
                    title="Configure View"
                  >
                    <i className="fas fa-sliders-h"></i>
                  </button>
                )}
                {(showDocPreview || activeCard.sheet_url || activeCard.source?.includes("sheet")) && (
                  <a href={showDocPreview ? showDocPreview.replace("/preview", "/edit") : activeCard.sheet_url || activeCard.sheet_url_schedule} target="_blank" rel="noreferrer" className="px-3 py-1 rounded text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200 flex items-center gap-2"><i className="fas fa-external-link-alt"></i> <span className="hidden sm:inline">Open in {activeCard.source?.includes("sheet") || activeCard.type === 'generic-sheet' ? "Sheets" : "Docs"}</span></a>
                )}
                {!showDocPreview && isCardEditable(activeCard) && canEdit && (<button onClick={toggleEditMode} className={`px-3 py-1 rounded text-sm font-medium transition-colors border ${isEditing ? 'bg-white text-slate-900 border-white' : 'bg-black/20 text-white border-transparent hover:bg-black/40'}`}><i className={`fas ${isEditing ? 'fa-check' : 'fa-pen'} mr-2`}></i>{isEditing ? "Done" : "Edit Card"}</button>)}
                {!showDocPreview && (isCardEditable(activeCard) || activeCard.type === 'generic-sheet') && canEdit && (
                  <button
                    onClick={() => deleteCard(activeCard)}
                    className="bg-red-500 px-3 py-1 rounded text-sm font-bold hover:bg-red-600 transition-colors text-white"
                    title="Delete Card"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
                {showDocPreview && <button onClick={() => setShowDocPreview(null)} className="bg-white/20 px-3 py-1 rounded text-sm font-medium"><i className="fas fa-arrow-left mr-2"></i> Back</button>}
                <button onClick={() => setActiveModal(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><i className="fas fa-times text-xl"></i></button>
              </div>
            </div>

            {/* Body */}
            <div className="p-0 overflow-y-auto custom-scroll flex flex-col h-full bg-slate-50">

              {/* VISUALIZATION MODE */}
              {activeCard.settings?.viewMode ? (
                /* 🟢 FIX: Show Loading if data is missing but viewMode is ON */
                (!activeCard.data && activeCard.type !== 'generic-sheet') ? (
                  <div className="flex h-full items-center justify-center text-slate-400 gap-3">
                    <i className="fas fa-circle-notch fa-spin text-2xl text-blue-500"></i>
                    <span className="font-medium">Loading Spreadsheet Data...</span>
                  </div>
                ) : isMapping ? (
                  <div className="flex h-full">
                    {/* LEFT SIDEBAR: CONTROLS */}
                      {/* LEFT SIDEBAR: CONTROLS */}
                      {/* 🟢 ADDED: text-slate-900 to force dark text on the white background */}
                      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col text-slate-900">
                      <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <i className="fas fa-magic text-purple-500"></i> Configure View
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">
                          Map columns to the card or chart.
                        </p>
                      </div>

                      <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {/* View Mode Selector */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Display Style</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, viewMode: 'table' } })}
                              className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${activeCard.settings?.viewMode === 'table' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              <i className="fas fa-table text-lg"></i> Table
                            </button>
                            <button
                              onClick={() => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, viewMode: 'card' } })}
                              className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${activeCard.settings?.viewMode === 'card' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              <i className="fas fa-th-large text-lg"></i> Cards
                            </button>
                            {/* 🟢 NEW CHART BUTTON */}
                            <button
                              onClick={() => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, viewMode: 'chart' } })}
                              className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${activeCard.settings?.viewMode === 'chart' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                              <i className="fas fa-chart-bar text-lg"></i> Chart
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full my-2"></div>

                        {/* 🟢 CHART CONFIGURATION */}
                        {activeCard.settings?.viewMode === 'chart' ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
                              <i className="fas fa-info-circle mr-1"></i> Ensure Y-Axis data is numeric.
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">X-Axis (Category)</label>
                              <select
                                value={activeCard.settings?.xAxisCol || ''}
                                onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, xAxisCol: e.target.value } })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Select Column --</option>
                                {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Y-Axis (Value/Number)</label>
                              <select
                                value={activeCard.settings?.yAxisCol || ''}
                                onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, yAxisCol: e.target.value } })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">-- Select Column --</option>
                                {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                              {/* 🟢 UPDATED: Chart Type Selection */}
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Chart Type</label>
                                <select
                                  value={activeCard.settings?.chartType || 'bar'}
                                  onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, chartType: e.target.value } })}
                                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white outline-none"
                                >
                                  <option value="bar">Bar Chart</option>
                                  <option value="line">Line Chart</option>
                                  <option value="area">Area Chart</option>
                                  <option value="pie">Pie Chart</option>
                                  <option value="donut">Donut Chart</option>
                                  {/* 👇 NEW OPTIONS ADDED */}
                                  <option value="metric">Big Number (KPI)</option>
                                  <option value="progress">Progress Bars</option>
                                </select>
                              </div>

                              {/* 🟢 LOGIC UPDATE: Hide X-Axis selector if "Big Number" is chosen */}
                              {activeCard.settings?.chartType !== 'metric' && (
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">X-Axis (Label)</label>
                                  <select
                                    value={activeCard.settings?.xAxisCol || ''}
                                    onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, xAxisCol: e.target.value } })}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">-- Select Column --</option>
                                    {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                              )}

                            {/* 🟢 NEW TOGGLE: CONTROL DASHBOARD VISIBILITY */}
                            <div className="pt-4 border-t border-slate-100">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  checked={activeCard.settings?.showOnDashboard || false}
                                  onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, showOnDashboard: e.target.checked } })}
                                />
                                <div>
                                  <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Show Chart on Dashboard</div>
                                  <div className="text-[10px] text-slate-400">Replace the folder icon with this chart</div>
                                </div>
                              </label>
                            </div>
                          </div>
                        ) : (
                          /* REGULAR CARD/TABLE MAPPING */
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Title <span className="text-red-400">*</span></label>
                              <select
                                id="titleCol"
                                value={activeCard.settings?.titleCol || ''}
                                onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, titleCol: e.target.value } })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="">-- Select Column --</option>
                                {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Date</label>
                              <select
                                value={activeCard.settings?.subtitleCol || ''}
                                onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, subtitleCol: e.target.value } })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="">-- None --</option>
                                {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Status Tag</label>
                              <select
                                value={activeCard.settings?.tagCol || ''}
                                onChange={(e) => setActiveCard({ ...activeCard, settings: { ...activeCard.settings, tagCol: e.target.value } })}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="">-- None --</option>
                                {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">Extra Details</label>
                              <div className="space-y-2">
                                {activeCard.settings?.extraFields?.map((field: string, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <select value={field} onChange={(e) => { const newFields = [...(activeCard.settings.extraFields || [])]; newFields[idx] = e.target.value; setActiveCard({ ...activeCard, settings: { ...activeCard.settings, extraFields: newFields } }); }} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm">
                                      {activeCard.columns?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button onClick={() => { const newFields = activeCard.settings.extraFields.filter((_: any, i: number) => i !== idx); setActiveCard({ ...activeCard, settings: { ...activeCard.settings, extraFields: newFields } }); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                  </div>
                                ))}
                                <button onClick={() => { const current = activeCard.settings.extraFields || []; const defaultCol = activeCard.columns?.[0] || ""; setActiveCard({ ...activeCard, settings: { ...activeCard.settings, extraFields: [...current, defaultCol] } }); }} className="text-xs font-bold text-blue-600 hover:underline">+ Add Field</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 border-t border-slate-200 bg-slate-50">
                        <button
                          onClick={() => saveMapping(activeCard.settings)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm mb-3 flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-check"></i> Save Configuration
                        </button>
                        <button onClick={() => setIsMapping(false)} className="w-full text-slate-500 text-sm font-medium hover:text-slate-800">Cancel</button>
                      </div>
                    </div>

                    {/* RIGHT SIDE: LIVE PREVIEW */}
                    <div className="flex-1 bg-slate-100/50 flex flex-col">
                      <div className="h-12 border-b border-slate-200 bg-white flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Live Preview
                      </div>
                      <div className="flex-1 p-10 flex items-center justify-center overflow-y-auto">

                          {/* 🟢 CHART RENDER LOGIC */}
                          {activeCard.settings?.viewMode === 'chart' ? (
                            <div className="w-full h-64 md:h-96 bg-white p-6 rounded-xl border border-slate-200 shadow-xl flex flex-col">
                              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{activeCard.title}</h3>
                              <div className="flex-1 min-h-0 flex flex-col justify-center">

                                {/* 1. BIG NUMBER (METRIC) VIEW */}
                                {activeCard.settings?.chartType === 'metric' ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="text-6xl md:text-8xl font-bold text-slate-800 tracking-tighter">
                                      {/* Sums up the selected column */}
                                      {activeCard.data.reduce((sum: number, row: any) => sum + cleanNumber(row[activeCard.settings.yAxisCol]), 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                      {activeCard.settings.yAxisCol}
                                    </div>
                                  </div>
                                ) : activeCard.settings?.chartType === 'progress' ? (

                                  /* 2. PROGRESS BARS VIEW */
                                  <div className="space-y-4 w-full px-4 overflow-y-auto max-h-full custom-scroll">
                                    {activeCard.data.map((row: any, idx: number) => {
                                      const val = cleanNumber(row[activeCard.settings.yAxisCol]);
                                      // Find the biggest number in the set to calculate percentage
                                      const maxVal = Math.max(...activeCard.data.map((r: any) => cleanNumber(r[activeCard.settings.yAxisCol])));
                                      const percent = maxVal > 0 ? (val / maxVal) * 100 : 0;

                                      return (
                                        <div key={idx} className="w-full">
                                          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>{row[activeCard.settings.xAxisCol]}</span>
                                            <span>{val.toLocaleString()}</span>
                                          </div>
                                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full shadow-sm transition-all duration-500"
                                              style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (

                                  /* 3. STANDARD CHARTS (Your existing Recharts code) */
                                  <ResponsiveContainer width="100%" height="100%">
                                    {activeCard.settings?.chartType === 'pie' || activeCard.settings?.chartType === 'donut' ? (
                                      <PieChart>
                                        <Pie
                                          data={activeCard.data.map((d: any) => ({ name: d[activeCard.settings.xAxisCol], value: cleanNumber(d[activeCard.settings.yAxisCol]) }))}
                                          cx="50%" cy="50%"
                                          innerRadius={activeCard.settings?.chartType === 'donut' ? 60 : 0}
                                          outerRadius={80}
                                          paddingAngle={5}
                                          dataKey="value"
                                        >
                                          {activeCard.data.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                        <Legend verticalAlign="bottom" height={36} />
                                      </PieChart>
                                    ) : activeCard.settings?.chartType === 'line' ? (
                                      <LineChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `${val}`} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey={activeCard.settings.yAxisCol} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                                      </LineChart>
                                    ) : activeCard.settings?.chartType === 'area' ? (
                                      <AreaChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey={activeCard.settings.yAxisCol} stroke="#8b5cf6" fill="#ddd6fe" />
                                      </AreaChart>
                                    ) : (
                                      <BarChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey={activeCard.settings.yAxisCol} fill="#6366f1" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                    )}
                                  </ResponsiveContainer>
                                )}
                              </div>
                            </div>
                        ) : activeCard.settings?.viewMode === 'card' ? (
                          <div className="w-full max-w-md pointer-events-none select-none bg-white p-6 rounded-xl border border-slate-200 shadow-xl scale-110 origin-center">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{activeCard.settings?.titleCol || "Select Title"}</div>
                                <h4 className="font-bold text-xl text-slate-800 line-clamp-2">
                                  {activeCard.data[0]?.[activeCard.settings?.titleCol] || "Sample Value"}
                                </h4>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-2 bg-slate-100 rounded w-full"></div>
                              <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-full max-w-md pointer-events-none select-none">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex gap-4">
                              <div className="h-2 bg-slate-200 rounded w-16"></div>
                              <div className="h-2 bg-slate-200 rounded w-16"></div>
                            </div>
                            <div className="p-4 space-y-4">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                  <div className="h-3 bg-slate-800 rounded w-1/3 opacity-80"></div>
                                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                  ) : activeCard.settings?.viewMode === 'chart' ? (
                    <div className="p-4 md:p-8 h-full flex flex-col">
                      <div className="flex-1 min-h-[300px] flex flex-col justify-center">

                        {/* 1. BIG NUMBER (METRIC) */}
                        {activeCard.settings?.chartType === 'metric' ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-7xl md:text-9xl font-bold text-slate-800 tracking-tighter">
                              {activeCard.data.reduce((sum: number, row: any) => sum + cleanNumber(row[activeCard.settings.yAxisCol]), 0).toLocaleString()}
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                              {activeCard.settings.yAxisCol}
                            </div>
                          </div>
                        ) : activeCard.settings?.chartType === 'progress' ? (

                          /* 2. PROGRESS BARS */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full max-w-5xl mx-auto overflow-y-auto custom-scroll max-h-full p-2">
                            {activeCard.data.map((row: any, idx: number) => {
                              const val = cleanNumber(row[activeCard.settings.yAxisCol]);
                              const maxVal = Math.max(...activeCard.data.map((r: any) => cleanNumber(r[activeCard.settings.yAxisCol])));
                              const percent = maxVal > 0 ? (val / maxVal) * 100 : 0;

                              return (
                                <div key={idx} className="w-full">
                                  <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                                    <span>{row[activeCard.settings.xAxisCol]}</span>
                                    <span>{val.toLocaleString()}</span>
                                  </div>
                                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full shadow-sm transition-all duration-1000 ease-out"
                                      style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (

                          /* 3. STANDARD CHARTS (Bar, Line, Pie, Area) */
                          <ResponsiveContainer width="100%" height="100%">
                            {activeCard.settings?.chartType === 'line' ? (
                              <LineChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `${val}`} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey={activeCard.settings.yAxisCol} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                              </LineChart>
                            ) : activeCard.settings?.chartType === 'area' ? (
                              <AreaChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey={activeCard.settings.yAxisCol} stroke="#8b5cf6" fill="#ddd6fe" />
                              </AreaChart>
                            ) : activeCard.settings?.chartType === 'pie' || activeCard.settings?.chartType === 'donut' ? (
                              <PieChart>
                                <Pie
                                  data={activeCard.data.map((d: any) => ({ name: d[activeCard.settings.xAxisCol], value: cleanNumber(d[activeCard.settings.yAxisCol]) }))}
                                  cx="50%" cy="50%"
                                  innerRadius={activeCard.settings?.chartType === 'donut' ? 60 : 0}
                                  outerRadius={120}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {activeCard.data.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                <Legend verticalAlign="bottom" />
                              </PieChart>
                            ) : (
                              <BarChart data={activeCard.data.map((d: any) => ({ ...d, [activeCard.settings.yAxisCol]: cleanNumber(d[activeCard.settings.yAxisCol]) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey={activeCard.settings.xAxisCol} stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey={activeCard.settings.yAxisCol} fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                ) : activeCard.settings?.viewMode === 'card' ? (
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCard.data.filter((row: any) => row[activeCard.settings.titleCol]).map((row: any, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{activeCard.settings.titleCol}</div>
                            <h4 className="font-bold text-xl text-slate-800 line-clamp-2">{row[activeCard.settings.titleCol] || "Untitled"}</h4>
                          </div>
                          {activeCard.settings.tagCol && row[activeCard.settings.tagCol] && (<span className="shrink-0 ml-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">{row[activeCard.settings.tagCol]}</span>)}
                        </div>

                        <div className="space-y-3">
                          {activeCard.settings.subtitleCol && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">{activeCard.settings.subtitleCol}</div>
                              <div className="text-sm text-slate-600 font-medium">{row[activeCard.settings.subtitleCol]}</div>
                            </div>
                          )}
                          {activeCard.settings.extraFields?.map((f: string) => (
                            <div key={f}>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">{f}</div>
                              <div className="text-sm text-slate-600 font-medium">{renderCellContent(row[f])}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full bg-slate-50">
                    <div className="px-8 py-4 border-b border-slate-200 bg-white flex justify-between items-center"><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Source: Google Sheet</div><div className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-mono">{activeCard.rowCount} Rows</div></div>
                    <div className="flex-1 overflow-auto p-8 custom-scroll">
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm"><tr>{activeCard.columns?.map((col: string, idx: number) => (<th key={idx} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap bg-slate-50">{col}</th>))}</tr></thead>
                          <tbody className="bg-white divide-y divide-slate-200">{activeCard.data.map((row: any, rIdx: number) => (<tr key={rIdx} className="hover:bg-blue-50/50 transition-colors group">{activeCard.columns?.map((col: string, cIdx: number) => (<td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm">{renderCellContent(row[col])}</td>))}</tr>))}</tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              ) : activeCard.id === "missions-status" ? (
                <div className="p-0 bg-slate-50 min-h-full">
                  {/* ... Missions Content ... */}
                  <div className="bg-sky-50 p-8 border-b border-sky-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div><div className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">Upcoming Departure</div><h2 className="text-3xl font-bold text-slate-800 mb-1">{activeCard.upcomingLoc} Team</h2><div className="flex items-center gap-2 text-slate-500"><i className="far fa-calendar-alt"></i> {activeCard.upcomingDate}</div></div>
                    <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-sky-100 text-center min-w-[120px]"><div className="text-4xl font-bold text-sky-600">{activeCard.upcomingOpen}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Spots</div></div>
                  </div>
                  <div className="p-8"><div className="flex items-center gap-2 mb-4"><i className="fas fa-ticket-alt text-slate-400"></i><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Open Registrations</h4></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{activeCard.trips.map((trip: any, idx: number) => (<div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"><div><div className="font-bold text-slate-800 text-lg">{trip.name}</div><div className="text-xs text-slate-400 mt-1">Registration Open</div></div><div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{trip.spots} Spots</div></div>))}</div></div>
                  <div className="bg-white p-8 border-t border-slate-200"><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-6">2026 Statistics</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-12"><div><div className="flex items-end gap-3 mb-2"><span className="text-4xl font-bold text-slate-800">{activeCard.totalNonStaff}</span><span className="text-sm text-slate-500 mb-1">Non-Staff ({activeCard.percentNonStaff})</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: activeCard.percentNonStaff }}></div></div></div><div><div className="flex items-end gap-3 mb-2"><span className="text-4xl font-bold text-slate-800">{activeCard.totalStaff}</span><span className="text-sm text-slate-500 mb-1">Staff ({activeCard.percentStaff})</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: activeCard.percentStaff }}></div></div></div></div></div>
                </div>
              ) : activeCard.source?.includes("sheet") ? (
                <div className="p-8 space-y-8">
                  {activeCard.scripture && <div><div className="flex items-center gap-2 mb-3"><i className="fas fa-book-open text-rose-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Primary Text</span></div><div className="text-lg text-slate-800 whitespace-pre-wrap">{activeCard.scripture}</div></div>}
                  {activeCard.worship && <div className="border-t border-slate-200 pt-6"><div className="flex items-center gap-2 mb-3"><i className="fas fa-music text-purple-500"></i><span className="text-xs font-bold text-slate-400 uppercase">Worship</span></div><div className="text-slate-700 whitespace-pre-wrap pl-4 border-l-4 border-purple-200 py-1">{activeCard.worship}</div></div>}
                  {activeCard.response_song && <div className="mt-2 ml-4"><div className="bg-purple-50 text-purple-900 p-3 rounded-md text-sm italic border border-purple-100 shadow-sm">{activeCard.response_song}</div></div>}
                </div>
              ) : (
                /* MANUAL CARD VIEW */
                !showDocPreview && (
                  <div className="p-0">
                    <div className="p-8">
                      {isEditing && canEdit && (<div className="flex flex-col gap-3">{getBlocks(activeCard).length === 0 && (<button onClick={() => updateResources([{ title: "General Files", items: [] }])} className="w-full py-4 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"><i className="fas fa-plus-circle mr-2"></i> Start Adding Files</button>)}<button onClick={addBlock} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">+ Create New Category Block</button></div>)}

                      {getBlocks(activeCard).map((block: any, bIdx: number) => (
                        <div key={bIdx} className="mb-8">
                          <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{block.title}</h4>
                            {isEditing && canEdit && <button onClick={() => deleteBlock(bIdx)} className="text-[10px] text-red-400 hover:text-red-600 uppercase font-bold">Delete Block</button>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {block.items.map((item: any, iIdx: number) => (
                              <div key={iIdx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-400 transition-all group cursor-pointer relative">
                                <div className="flex items-center gap-4 flex-1" onClick={() => handleFileClick(item)}>
                                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-500 flex items-center justify-center transition-colors">{getFileIcon(item)}</div>
                                  <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600">{item.title}</div>
                                </div>
                                {isEditing && canEdit && <button onClick={() => deleteItemFromBlock(bIdx, iIdx)} className="absolute top-2 right-2 text-slate-200 hover:text-red-500 p-1"><i className="fas fa-times-circle"></i></button>}
                              </div>
                            ))}
                          </div>
                          {isEditing && canEdit && (
                            <div className="mt-4 pt-4 border-t border-slate-50">
                              {addingLinkToBlock === bIdx ? (
                                <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                                  <input ref={(el) => { newItemTitleRefs.current[`block-${bIdx}`] = el }} type="text" placeholder="Name your file..." autoFocus className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                  <input ref={(el) => { newItemUrlRefs.current[`block-${bIdx}`] = el }} type="text" placeholder="Paste URL..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                  <button onClick={() => addItemToBlock(bIdx)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">Add</button>
                                  <button onClick={() => setAddingLinkToBlock(null)} className="text-slate-400 hover:text-slate-600 px-2 transition-colors"><i className="fas fa-times"></i></button>
                                </div>
                              ) : (
                                <div className="flex gap-3">
                                  <button onClick={() => handleOpenPicker(bIdx)} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"><svg viewBox="0 0 87.3 78" width="14" height="14" className="opacity-80"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l18.25-31.6H6.6v21.65zm13.1-22.8L6.6 19.85l-3.3 5.7C2.1 27.9 1.5 30.2 1.5 32.55v15.85l18.2-4.35zM22.65 6.6L19.35.9C18 .1 16.55-.3 15-.3h-3.4l18.25 31.65 14.2-24.6h-21.4zM62.6 6.6h-14.8l-7.1 12.35L54.1 36.3l14.8-25.6c-.65-1.9-1.9-3.35-3.65-4.1zM34.7 44.05l-7.1 12.3 10.75 18.6c2.35 0 4.7-.6 6.85-1.8L84.65 44.05H34.7zM66.45 44.05l18.2 31.6c1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65-18.25-31.6-7.1 9.95z" fill="currentColor" /></svg>Add from Drive</button>
                                  <button onClick={() => setAddingLinkToBlock(bIdx)} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100">+ Add Link</button>
                                </div>
                              )}
                            </div>
                          )}
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

      {showTutorial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shadow-sm"><i className="fas fa-book-reader"></i></div>
                <div><h3 className="text-xl font-bold text-slate-800">Quick Start Guide</h3><p className="text-slate-500 text-sm">Get the most out of your dashboard</p></div>
              </div>
              <button onClick={() => setShowTutorial(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all" title="Close Guide"><i className="fas fa-times text-lg"></i></button>
            </div>
            {/* Body */}
            <div className="p-8 space-y-8 text-slate-600">
              <div className="flex gap-5"><div className="w-12 h-12 shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl border border-purple-100 shadow-sm"><i className="fas fa-chart-pie"></i></div><div><h4 className="font-bold text-slate-800 text-lg">Visualize Data Instantly</h4><p className="text-sm leading-relaxed mt-1">Add a Google Sheet to any card. Open it, and click the purple <span className="font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-xs border border-purple-100">Visualize Data</span> button to automatically turn your rows and columns into beautiful charts.</p></div></div>
              <div className="flex gap-5"><div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl border border-blue-100 shadow-sm"><i className="fas fa-folder-open"></i></div><div><h4 className="font-bold text-slate-800 text-lg">Organize Your Projects</h4><p className="text-sm leading-relaxed mt-1">Create <strong>Cards</strong> to group related Google Docs, PDFs, and links in one place. Drag and drop cards between sections to manage your workflow stages.</p></div></div>
              <div className="flex gap-5"><div className="w-12 h-12 shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl border border-emerald-100 shadow-sm"><i className="fas fa-user-plus"></i></div><div><h4 className="font-bold text-slate-800 text-lg">Invite Your Team</h4><p className="text-sm leading-relaxed mt-1">Click the <strong>Invite</strong> button to add team members via email. They will get a magic link to instantly view and edit this dashboard with you.</p></div></div>
            </div>
            {/* Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 text-center">
              <button onClick={() => setShowTutorial(false)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0">Got it, let's go!</button>
            </div>
          </div>
        </div>
      )}

      <DashboardChat contextData={{ title: config?.title }} />
      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} dashboardTitle={config?.title || "Dashboard"} shareToken={config?.share_token} dashboardId={dashboardId} />
    </div>
  );
}