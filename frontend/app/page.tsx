"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Added Sonner
import { generateDraft, getDraft, publishDraft } from "@/lib/api";

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && !draft) {
      interval = setInterval(async () => {
        try {
          const data = await getDraft(jobId);
          
          // Check for success
          if (data && (data.status === "review_required" || data.status === "completed")) {
            setDraft(data);
            setLoading(false);
            toast.success("Amaka has finished the research!");
            clearInterval(interval);
          } 
          // Check for failure so we don't poll forever
          else if (data && data.status === "failed") {
            setLoading(false);
            toast.error("Research failed: " + data.raw_content.substring(0, 50));
            setJobId(null);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId, draft]);

  // Update the editedContent state when the draft first arrives
  useEffect(() => {
    if (draft) setEditedContent(draft.raw_content);
  }, [draft]);

  // const handlePublish = async () => {
  //   if (!jobId) return;
  //   toast.promise(publishDraft(jobId), {
  //     loading: 'Posting to X/IG...',
  //     success: 'Post is live! 🚀',
  //     error: 'Failed to post.',
  //   });
  // };
    const handlePublish = async () => {
    if (!jobId) return;
    try {
      await publishDraft(jobId);
      toast.success("Post is live! 🚀");
      // Reset state for the next mission
      setDraft(null);
      setTopic("");
      setJobId(null);
    } catch (err) {
      toast.error("Failed to post.");
    }
  };

  // const handleGenerate = async () => {
  //   if (!topic) return toast.error("Please enter a topic first");

  //   setLoading(true);
  //   setDraft(null);
    
  //   try {
  //     const data = await generateDraft(topic);
  //     // Backend returns 'id', matching your previous logs
  //     if (data && data.id) {
  //       setJobId(data.id);
  //       toast.info("CrewAI agents are now researching...");
  //     } else {
  //       throw new Error("No ID returned from backend");
  //     }
  //   } catch (err) {
  //     setLoading(false);
  //     toast.error("Could not connect to the backend server.");
  //   }
  // };
    const handleGenerate = async () => {
    setLoading(true);
    setDraft(null);
    
    try {
      const data = await generateDraft(topic);
      
      // CHECK THIS LINE: Match the key from your JSON output
      if (data && data.job_id) {
        setJobId(data.job_id);
        toast.info("Amaka is now researching...");
      } else {
        // If the backend sent data but no job_id, it triggers your catch block
        console.error("Backend sent data but missing job_id:", data);
        toast.error("Backend response format incorrect.");
        setLoading(false);
      }
    } catch (err) {
      // This is what's being triggered right now!
      setLoading(false);
      toast.error("Couldn't connect to backend server");
      console.error("Generate error:", err);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Amaka AI Mission Control</h1>
          <p className="text-muted-foreground">Digital advocacy for Port Harcourt & Nigeria</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">2026 Election Cycle</Badge>
      </header>

      <section className="flex gap-2 bg-card p-4 rounded-xl border shadow-sm">
        <Input 
          placeholder="Topic (e.g., fuel subsidy impact in Rivers State)" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-background"
        />
        <Button onClick={handleGenerate} disabled={loading} className="min-w-[160px]">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin text-lg">⏳</span> Thinking...
            </span>
          ) : "Generate Post"}
        </Button>
      </section>

      {draft && (
        <Card className="border-2 border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-xl flex items-center justify-between">
              Proposed Content
              <Badge>Draft</Badge>
            </CardTitle>
          </CardHeader>
          {/* <CardContent className="space-y-4 pt-6">
            <div className="p-6 bg-muted/50 rounded-lg whitespace-pre-wrap font-serif italic text-lg leading-relaxed border shadow-inner">
              {draft.raw_content}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Edit Text</Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Approve & Post to X/IG
              </Button>
            </div>
          </CardContent> */}
          <CardContent className="space-y-4">
            {isEditing ? (
              <textarea 
                className="w-full min-h-[200px] p-4 bg-background border rounded-lg font-serif text-lg"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            ) : (
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-serif italic text-lg">
                "{editedContent}"
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Save View" : "Edit Text"}
              </Button>
              <Button 
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve & Post to X/IG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}