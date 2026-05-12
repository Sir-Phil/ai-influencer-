"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FactCheckCard } from "@/components/fact-check-card";
import { FactCheck } from "@/types";
import { 
  generateDraft, 
  getDraft, 
  publishDraft, 
  updateDraft, 
  getFactChecks 
} from "@/lib/api";

export default function Dashboard() {
  // Content States
  const [topic, setTopic] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Fact Check State
  const [factChecks, setFactChecks] = useState<FactCheck[]>([]);

  // Memoized fetch to use in multiple places
  const fetchFacts = useCallback(async () => {
    try {
      const data = await getFactChecks();
      setFactChecks(data);
    } catch (err) {
      console.error("Failed to load fact checks");
    }
  }, []);

  // 1. Initial Load: Fetch Fact Checks
  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  // 2. Polling for Draft Generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && !draft) {
      interval = setInterval(async () => {
        try {
          const data = await getDraft(jobId);
          if (data && (data.status === "review_required" || data.status === "completed")) {
            setDraft(data);
            setLoading(false);
            toast.success("Amaka has finished the research!");
            fetchFacts(); // Refresh truth monitor with new findings
            clearInterval(interval);
          } else if (data && data.status === "failed") {
            setLoading(false);
            toast.error("Research failed.");
            setJobId(null);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId, draft, fetchFacts]);

  useEffect(() => {
    if (draft) setEditedContent(draft.raw_content);
  }, [draft]);

  const handleGenerate = async () => {
    if (!topic) return toast.error("Please enter a topic");
    setLoading(true);
    setDraft(null);
    try {
      const data = await generateDraft(topic);
      if (data && (data.id || data.job_id)) {
        setJobId(data.id || data.job_id);
        toast.info("Amaka is starting research...");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Backend connection failed.");
    }
  };

  const handleSaveEdit = async () => {
    if (!jobId) return;
    try {
      await updateDraft(jobId, editedContent);
      setIsEditing(false);
      toast.success("Edits saved successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handlePublish = async () => {
    if (!jobId) return;
    try {
      await publishDraft(jobId);
      toast.success("Post is live on X/IG! 🚀");
      setDraft(null);
      setTopic("");
      setJobId(null);
    } catch (err) {
      toast.error("Social media dispatch failed.");
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Amaka AI Mission Control
          </h1>
          <p className="text-muted-foreground font-medium">Verified Advocacy for Rivers State & Nigeria</p>
        </div>
        <Badge variant="secondary" className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-2">
          2026 Election Protocol
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Content Creation Studio */}
        <div className="lg:col-span-2 space-y-6">
          <section className="flex flex-col sm:flex-row gap-3 bg-card p-4 rounded-2xl border shadow-md">
            <Input 
              placeholder="Enter a political event or claim..." 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-background h-12"
            />
            <Button onClick={handleGenerate} disabled={loading} className="h-12 px-8 font-bold transition-all hover:scale-105">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-lg">⚙️</span> Analyzing...
                </span>
              ) : "Research & Draft"}
            </Button>
          </section>

          {draft && (
            <Card className="border-2 border-primary/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="bg-muted/30 border-b py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">📝 AI Content Draft</span>
                  <Badge variant="outline" className="animate-pulse bg-primary/5">Awaiting Review</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {isEditing ? (
                  <textarea 
                    className="w-full min-h-[300px] p-5 bg-background border-2 rounded-xl font-serif text-lg leading-relaxed focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                ) : (
                  <div className="p-8 bg-muted/20 rounded-xl whitespace-pre-wrap font-serif italic text-xl leading-relaxed border shadow-inner text-slate-800">
                    {editedContent}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="font-semibold"
                    onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
                  >
                    {isEditing ? "Save Changes" : "Refine Tone"}
                  </Button>
                  <Button 
                    size="lg"
                    onClick={handlePublish} 
                    className="bg-green-600 hover:bg-green-700 font-bold px-10 shadow-lg shadow-green-200"
                  >
                    Approve & Dispatch
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Truth Monitor Feed */}
        <aside className="space-y-6 lg:border-l lg:pl-8">
          <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
            <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
              TRUTH MONITOR 
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
            </h2>
            <Button variant="ghost" size="sm" onClick={fetchFacts} className="text-[10px] uppercase font-bold">
              Refresh Feed
            </Button>
          </div>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
            {factChecks.length > 0 ? (
              factChecks.map((check) => (
                <FactCheckCard key={check.id} check={check} />
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl opacity-50">
                <p className="text-sm font-medium italic">No claims verified yet.</p>
                <p className="text-[10px] mt-1">Real-time data will appear here.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}