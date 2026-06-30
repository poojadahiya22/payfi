import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Send, Sparkles, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

const Chat = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [drawer, setDrawer] = useState(false);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chat_threads").select("*").order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  // Bootstrap: if no threadId, pick newest or create new
  useEffect(() => {
    if (!user || threadId) return;
    (async () => {
      const { data } = await supabase.from("chat_threads").select("id").order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (data) {
        navigate(`/chat/${data.id}`, { replace: true });
      } else {
        const { data: ins } = await supabase.from("chat_threads").insert({ user_id: user.id, title: "New chat" }).select().single();
        if (ins) navigate(`/chat/${ins.id}`, { replace: true });
      }
    })();
  }, [user, threadId, navigate]);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["messages", threadId],
    enabled: !!threadId,
    queryFn: async (): Promise<Msg[]> => {
      const { data } = await supabase.from("chat_messages").select("*").eq("thread_id", threadId!).order("created_at");
      return (data ?? []) as Msg[];
    },
  });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [threadId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  const newThread = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_threads").insert({ user_id: user.id, title: "New chat" }).select().single();
    if (data) { qc.invalidateQueries({ queryKey: ["threads"] }); navigate(`/chat/${data.id}`); setDrawer(false); }
  };

  const deleteThread = async (id: string) => {
    await supabase.from("chat_threads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (id === threadId) navigate("/chat");
  };

  const send = async () => {
    if (!input.trim() || !threadId || !user || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Insert user message
    await supabase.from("chat_messages").insert({ thread_id: threadId, user_id: user.id, role: "user", content: text });
    refetch();

    // Update title if first message
    if (messages.length === 0) {
      const title = text.slice(0, 40);
      await supabase.from("chat_threads").update({ title }).eq("id", threadId);
      qc.invalidateQueries({ queryKey: ["threads"] });
    }

    // Call edge function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfi-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ threadId }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || `Error ${resp.status}`);
      }
      await refetch();
    } catch (e: any) {
      toast.error(e.message || "AI request failed");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 p-3 border-b border-border">
        <Link to="/dashboard"><Button size="icon" variant="ghost"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <button onClick={() => setDrawer(true)} className="flex-1 text-left">
          <p className="text-xs text-muted-foreground">PayFi AI</p>
          <p className="text-sm font-medium truncate">{threads.find((t: any) => t.id === threadId)?.title || "New chat"}</p>
        </button>
        <Button size="icon" variant="ghost" onClick={newThread}><Plus className="w-5 h-5" /></Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="text-center pt-16 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold">Ask PayFi AI</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Get personalized insights from your transactions.</p>
            <div className="flex flex-col gap-2 max-w-sm mx-auto pt-3">
              {["Where did I spend most this month?", "How can I save more?", "Why are my expenses increasing?"].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-sm p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-left">{s}</button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-background">
        <div className="flex gap-2 items-end max-w-2xl mx-auto">
          <Textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about your spending…" rows={1} className="resize-none min-h-[44px] max-h-32" />
          <Button onClick={send} disabled={sending || !input.trim()} size="icon" className="h-11 w-11 gradient-primary text-primary-foreground shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Threads drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setDrawer(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border z-50 p-4 space-y-3 overflow-y-auto">
              <h3 className="font-semibold mb-2">Conversations</h3>
              <Button onClick={newThread} className="w-full gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" />New chat</Button>
              <div className="space-y-1">
                {threads.map((t: any) => (
                  <div key={t.id} className={`flex items-center gap-1 rounded-lg ${t.id === threadId ? "bg-accent" : ""}`}>
                    <button onClick={() => { navigate(`/chat/${t.id}`); setDrawer(false); }}
                      className="flex-1 flex items-center gap-2 p-2 text-left text-sm truncate">
                      <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{t.title}</span>
                    </button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteThread(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
