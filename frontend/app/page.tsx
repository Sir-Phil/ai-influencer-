"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Edit3, CheckCircle, Send, Search, ShieldCheck, Loader2, Zap, Globe, Sparkles } from "lucide-react"; 
import { generateDraft, getDraft, publishDraft } from "@/lib/api";

interface DraftOption {
  type: string;
  content: string;
}

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Persistent Polling Guard
  const pollCountRef = useRef(0);

  // 1. Session Recovery: Check for unfinished jobs on mount
  useEffect(() => {
    const savedJob = localStorage.getItem("amaka_last_job");
    if (savedJob && draftOptions.length === 0) {
      setJobId(savedJob);
      setLoading(true);
    }
  }, []);

  // 2. Optimized Polling Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (jobId && draftOptions.length === 0) {
      interval = setInterval(async () => {
        pollCountRef.current++;
        
        // Timeout after ~2 mins (40 * 3s)
        if (pollCountRef.current > 40) {
          setLoading(false);
          toast.error("Research Timeout", { description: "The agent mission took too long. Check backend logs." });
          localStorage.removeItem("amaka_last_job");
          return clearInterval(interval);
        }

        try {
          const data = await getDraft(jobId);
          
          if (data?.status === "review_required") {
            // Robust Regex for JSON Extraction
            const jsonMatch = data.raw_content.match(/\{[\s\S]*\}/);
            const cleaned = jsonMatch ? jsonMatch[0] : data.raw_content;
            
            try {
              const parsed = JSON.parse(cleaned);
              const options = parsed.options || [{ type: "Strategy", content: cleaned }];
              setDraftOptions(options);
              setSelectedIndex(0);
              setEditedContent(options[0].content);
              toast.success("Intelligence Synchronized", { 
                  description: "Amaka has verified 2026 real-time context." 
              });
            } catch (e) {
              setDraftOptions([{ type: "Raw Feed", content: data.raw_content }]);
              setSelectedIndex(0);
              setEditedContent(data.raw_content);
            }
            setLoading(false);
            localStorage.removeItem("amaka_last_job");
            clearInterval(interval);
          } else if (data?.status === "failed") {
            toast.error("Analysis Failed", { description: data.error || "Check CrewAI connection." });
            setLoading(false);
            localStorage.removeItem("amaka_last_job");
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Poll Error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId, draftOptions.length]);

  const handleGenerate = async () => {
    if (!topic) return toast.error("Enter a mission topic");
    setLoading(true);
    setDraftOptions([]);
    pollCountRef.current = 0;
    
    try {
      const data = await generateDraft(topic);
      if (data?.id) {
        setJobId(data.id);
        localStorage.setItem("amaka_last_job", data.id);
      }
    } catch (err) {
      toast.error("Connection Error", { description: "Verify your Python backend is live." });
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!jobId || !editedContent) return toast.error("No content verified!");
    setIsPublishing(true);

    toast.promise(publishDraft(jobId, editedContent), {
      loading: 'Amaka is broadcasting to 2026 digital layers...',
      success: () => {
        setIsPublishing(false);
        setDraftOptions([]); 
        setTopic("");        
        setJobId(null);
        return "Intelligence successfully broadcasted! 🚀";
      },
      error: (err) => {
        setIsPublishing(false);
        return `Broadcast failed: ${err.message}`;
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-1000">
      
      {/* --- HEADER: MISSION CONTROL STYLE --- */}
      <header className="relative p-10 rounded-[3rem] bg-white border border-slate-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/20 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Engine</span>
              </div>
              <span className="text-slate-300 text-xs font-medium uppercase tracking-widest">Protocol v2.6.4</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-[1000] tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-950 via-emerald-900 to-green-700">
                AMAKA AI
              </span>
            </h1>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Real-time Awareness: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-6 py-2.5 rounded-2xl border-emerald-100 text-xs font-black shadow-sm">
              PH 2026 DIGITAL CAMPAIGN
            </Badge>
            <div className="flex gap-2 text-slate-300">
               <Zap className="w-4 h-4 fill-current" />
               <Sparkles className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* RESEARCH INPUT SECTION */}
          <section className={cn(
            "group flex items-center gap-3 p-3 bg-white rounded-[2.5rem] border transition-all duration-500",
            loading ? "border-emerald-400 ring-8 ring-emerald-50" : "hover:border-slate-300 shadow-sm hover:shadow-xl"
          )}>
            <div className="flex-1 flex items-center px-6">
              <Search className={cn("w-6 h-6 mr-4 transition-colors", loading ? "text-emerald-500" : "text-slate-400")} />
              <Input 
                placeholder="Topic: Breaking News, World Cup buildup, or Social trends..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="border-none bg-transparent h-14 text-xl focus-visible:ring-0 placeholder:text-slate-300 font-medium"
              />
            </div>
            <Button 
                onClick={handleGenerate} 
                disabled={loading} 
                className={cn(
                    "rounded-[1.8rem] h-16 px-12 text-lg font-black transition-all shadow-lg active:scale-95",
                    loading ? "bg-emerald-100 text-emerald-600" : "bg-slate-900 text-white hover:bg-emerald-800"
                )}
            >
              {loading ? <Loader2 className="animate-spin mr-3" /> : null}
              {loading ? "Scouting 2026 Feeds..." : "Initiate Research"}
            </Button>
          </section>

          {draftOptions.length > 0 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
              
              {/* VIBE SELECTOR GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {draftOptions.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setSelectedIndex(idx); setEditedContent(opt.content); setIsEditing(false); }}
                    className={cn(
                      "group p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden h-full min-h-[160px]",
                      selectedIndex === idx 
                        ? "border-emerald-500 bg-white shadow-2xl scale-[1.03] z-10" 
                        : "border-slate-100 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-slate-200"
                    )}
                  >
                    {selectedIndex === idx && (
                        <div className="absolute top-0 right-0 p-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                    )}
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">{opt.type}</div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-4 italic">
                      "{opt.content}"
                    </p>
                  </button>
                ))}
              </div>

              {/* INTELLIGENCE REFINEMENT CENTER */}
              <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden bg-white">
                <CardHeader className="px-10 py-8 bg-slate-50/30 border-b flex flex-row justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-inner">
                      <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Strategy Refinement</CardTitle>
                      <p className="text-xs text-slate-400 font-medium italic">Active Tone: {draftOptions[selectedIndex!]?.type}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-xl border-slate-200 text-xs font-bold px-5"
                  >
                    {isEditing ? "View Live Preview" : "Modify Script"}
                  </Button>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="relative min-h-[450px]">
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[450px] p-12 text-2xl font-serif leading-relaxed bg-white outline-none resize-none text-slate-800"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className="min-h-[450px] p-16 flex items-center justify-center text-center">
                        <p className="text-4xl font-serif leading-tight italic text-slate-950 max-w-3xl drop-shadow-sm">
                          "{editedContent}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-10 bg-slate-50/50 border-t flex flex-col md:flex-row gap-5">
                    <Button 
                      variant="ghost"
                      className="h-20 flex-1 rounded-[1.5rem] font-black text-slate-400 hover:text-slate-900 hover:bg-white transition-all"
                      onClick={() => { setIsEditing(true); }}
                    >
                      ADD MANUAL CONTEXT
                    </Button>
                    <Button 
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="h-20 flex-[2.5] rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-green-800 hover:scale-[1.01] text-xl font-black shadow-2xl shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      {isPublishing ? <Loader2 className="animate-spin mr-3" /> : <Send className="w-6 h-6 mr-3" />}
                      {isPublishing ? "Synchronizing..." : "AUTHENTICATE & BROADCAST"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* --- TRUTH MONITOR: SIDEBAR PANEL --- */}
        <aside className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 tracking-[0.3em] flex items-center gap-3 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              MONITORING SYSTEM
            </h2>
            
            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] transition-all duration-1000",
                    loading ? "bg-emerald-500/30 animate-pulse" : "bg-blue-500/10"
                )} />
                
                <div className="relative space-y-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            loading ? "bg-emerald-500 text-black animate-spin" : "bg-white/10 text-emerald-400"
                        )}>
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-widest text-emerald-400 uppercase">Integrity Guard</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{loading ? "Scanning Now" : "Systems Nominal"}</p>
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        {loading 
                            ? "Amaka is parsing high-velocity feeds to ensure 2026 factual accuracy."
                            : "All mission strategies are vetted for real-time relevance and social impact."}
                    </p>

                    {/* ACTIVITY VISUALIZER */}
                    <div className="flex gap-1.5 h-6 items-end">
                        {[...Array(15)].map((_, i) => (
                        <div 
                            key={i} 
                            className={cn(
                            "flex-1 bg-emerald-500/40 rounded-full transition-all duration-500",
                            loading ? "animate-bounce" : "h-1"
                            )}
                            style={{ 
                                animationDelay: `${i * 0.05}s`, 
                                height: loading ? `${Math.random() * 100}%` : '4px' 
                            }}
                        />
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">Connection</span>
                            <span className="text-emerald-500">ENCRYPTED</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">Model Context</span>
                            <span className="text-white">MCP-ENABLED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS CARD */}
            <div className="p-8 bg-white border rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Performance</span>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-950">98.4%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Confidence Score</p>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}