import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { fetchRulesWithCSS, updateRule } from "../api/rules";
import { getUserMoments, createMoment, deleteMoment } from "../api/moments";
import { getUserTracks, createTrack, deleteTrack } from "../api/tracks";
import { fetchProfile } from "../api/user"; // Import profile API

export const useDashboard = (token: string) => {
  // We use a ref for editorDraft so syncData can read/write it
  // without triggering an infinite re-render loop.
  const isInitialLoad = useRef(true);

  // --- IndexedDB Queries ---
  const moments =
    useLiveQuery(() => db.moments.reverse().sortBy("timestamp"), []) || [];
  const rules = useLiveQuery(() => db.rules.toArray(), []) || [];
  // Added: Live Query for Profile data
  const localProfile = useLiveQuery(() => db.profile.get("current"), []);

  // --- UI & View State ---
  const [viewMode, setViewMode] = useState<"focus" | "editor">("focus");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Data & Sync State ---
  const [tracks, setTracks] = useState<any[]>([]);
  const [editorDraft, setEditorDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState("Never synced");
  const [customTypes, setCustomTypes] = useState<string[]>([]);


  const [xp, setXp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (localProfile) {
      setXp(localProfile.xp ?? 0);
      setLevel(localProfile.level ?? 1);
    }
  }, [localProfile]);

  const injectCSS = useCallback((vars: Record<string, string>) => {
    if (!vars) return;
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, String(v))
    );
  }, []);

  const syncData = useCallback(async () => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const [mRes, tRes, rRes, pRes] = await Promise.all([
        getUserMoments(token),
        getUserTracks(token),
        fetchRulesWithCSS(token),
        fetchProfile(), 
      ]);

      await db.transaction(
        "rw",
        [db.moments, db.rules, db.profile],
        async () => {
          await db.moments.clear();
          await db.moments.bulkAdd(mRes);
          await db.rules.clear();
          await db.rules.bulkAdd(rRes.rules);
          await db.profile.put({
            id: "current",
            ...pRes.data,
          });
        }
      );

      setTracks(tRes);
      setXp(pRes.data.xp || 0);
      setLevel(pRes.data.level || 1);
      injectCSS(rRes.cssVariables);

      if (isInitialLoad.current) {
        setEditorDraft(rRes.rules[0]?.content || "");
        isInitialLoad.current = false;
      }

      setLastSynced(new Date());
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [token, injectCSS]);

  const applyCSS = useCallback(async () => {
    if (!token) return;
    try {
      const [rRes, pRes] = await Promise.all([
        fetchRulesWithCSS(token),
        fetchProfile(),
      ]);

      injectCSS(rRes.cssVariables);

      await db.profile.update("current", {
        xp: pRes.data.xp,
        level: pRes.data.level,
      });

      setXp(pRes.data.xp || 0);
      setLevel(pRes.data.level || 1);
    } catch (err) {
      console.error("CSS Refresh Error:", err);
    }
  }, [token, injectCSS]);

  const updateSyncRelativeTime = useCallback(() => {
    if (!lastSynced) return;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
    if (diff < 5) setSyncMessage("Just now");
    else if (diff < 60) setSyncMessage("Seconds ago");
    else setSyncMessage(`${Math.floor(diff / 60)}m ago`);
  }, [lastSynced]);

  useEffect(() => {
    syncData();
    const syncInterval = setInterval(syncData, 60000);
    return () => clearInterval(syncInterval);
  }, [syncData]);

  useEffect(() => {
    const timeInterval = setInterval(updateSyncRelativeTime, 10000);
    updateSyncRelativeTime();
    return () => clearInterval(timeInterval);
  }, [updateSyncRelativeTime]);

  const handleAddMoment = async (momentData: any) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const newMoment = await createMoment(token, momentData);
      await db.moments.add(newMoment);
      await applyCSS();
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteMoment = async (id: string) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      await db.moments.delete(id);
      await deleteMoment(token, id);
      await applyCSS();
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveRules = async () => {
    if (!token || !rules[0]?._id) return;
    setSaveLoading(true);
    setIsSyncing(true);
    try {
      const res = await updateRule(token, rules[0]._id, editorDraft);
      if (res.rules && res.rules[0]) await db.rules.put(res.rules[0]);

      setXp(res.xp || 0);
      setLevel(res.level || 1);
      await db.profile.update("current", { xp: res.xp, level: res.level });

      injectCSS(res.cssVariables);
      setLastSynced(new Date());
    } catch (err) {
      alert("Error saving rules.");
    } finally {
      setSaveLoading(false);
      setIsSyncing(false);
    }
  };

  const handleAddTrack = async (trackName: string) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const savedTrack = await createTrack(token, trackName);
      setTracks((prev) => [...prev, savedTrack]);
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm("Delete this track permanently?")) return;
    setIsSyncing(true);
    try {
      setTracks((prev) => prev.filter((t) => t._id !== trackId));
      if (token) await deleteTrack(token, trackId);
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddType = (typeName: string) => {
    const normalized = typeName.trim().toLowerCase();
    if (normalized && !availableTypes.includes(normalized)) {
      setCustomTypes((prev) => [...prev, normalized]);
    }
  };

  const handleDeleteType = async (typeName: string) => {
    if (!window.confirm(`Delete all moments marked as "${typeName}"?`)) return;
    setIsSyncing(true);
    try {
      const momentsToDelete = moments.filter(
        (m) => m.type.toLowerCase() === typeName.toLowerCase()
      );
      await db.moments
        .filter((m) => m.type.toLowerCase() === typeName.toLowerCase())
        .delete();
      if (token && momentsToDelete.length > 0) {
        await Promise.all(
          momentsToDelete.map((m) => deleteMoment(token, m._id))
        );
      }
      setCustomTypes((prev) =>
        prev.filter((t) => t.toLowerCase() !== typeName.toLowerCase())
      );
      await applyCSS();
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    if (moments.length === 0) return;
    const headers = [
      "Day",
      "Date",
      "Time",
      "Category",
      "Moment Content",
      "Vibes/Tracks",
    ];
    const rows = moments.map((m) => {
      const d = new Date(m.timestamp);
      return [
        d.toLocaleDateString("en-US", { weekday: "long" }),
        d.toLocaleDateString("en-US"),
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        m.type.toUpperCase(),
        `"${m.content.replace(/"/g, '""')}"`,
        `"${m.track.join(" | ")}"`,
      ];
    });
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Life_Stream_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableTypes = useMemo(() => {
    const typesInData = moments.map((m) => m.type.toLowerCase());
    const defaults = ["happy", "reflective", "focused", "stressed"];
    return Array.from(new Set([...defaults, ...typesInData, ...customTypes]));
  }, [moments, customTypes]);

  const filteredMoments = useMemo(() => {
    return moments.filter((m) => {
      const query = searchQuery.toLowerCase();
      const momentDate = new Date(m.timestamp).toISOString().split("T")[0];
      const matchesDate = selectedDate ? momentDate === selectedDate : true;
      const matchesSearch =
        m.content.toLowerCase().includes(query) ||
        m.type.toLowerCase().includes(query) ||
        m.track.some((t: string) => t.toLowerCase().includes(query));
      return matchesDate && matchesSearch;
    });
  }, [moments, searchQuery, selectedDate]);

  return {
    moments,
    filteredMoments,
    rules,
    tracks,
    availableTypes,
    editorDraft,
    loading,
    saveLoading,
    isSyncing,
    syncMessage,
    viewMode,
    searchQuery,
    selectedDate,
    isSettingsOpen,
    xp,
    level,
    setEditorDraft,
    setViewMode,
    setSearchQuery,
    setSelectedDate,
    setIsSettingsOpen,
    handleAddMoment,
    handleDeleteMoment,
    handleSaveRules,
    handleAddTrack,
    handleDeleteTrack,
    handleAddType,
    handleDeleteType,
    handleExportCSV,
    syncData,
  };
};
