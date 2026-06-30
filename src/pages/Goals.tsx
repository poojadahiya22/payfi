import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { useGoals } from "@/hooks/useFinanceData";
import { formatINR } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Goals = () => {
  const { data: goals = [] } = useGoals();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("goals").insert({
      user_id: user.id, name, target_amount: parseFloat(target), saved_amount: parseFloat(saved || "0"), deadline: deadline || null,
    });
    if (error) return toast.error(error.message);
    setOpen(false); setName(""); setTarget(""); setSaved(""); setDeadline("");
    qc.invalidateQueries({ queryKey: ["goals"] });
    toast.success("Goal added");
  };

  const remove = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  const addToGoal = async (id: string, current: number, target: number) => {
    const amt = Number(prompt("Add amount (₹)") || 0);
    if (!amt) return;
    await supabase.from("goals").update({ saved_amount: Math.min(target, current + amt) }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground rounded-full"><Plus className="w-4 h-4 mr-1" />New goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Buy laptop" /></div>
              <div><Label>Target (₹)</Label><Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} required /></div>
              <div><Label>Already saved (₹)</Label><Input type="number" value={saved} onChange={(e) => setSaved(e.target.value)} /></div>
              <div><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Target className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No goals yet. Set your first savings goal.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(100, (g.saved_amount / g.target_amount) * 100);
            const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000) : null;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4 space-y-2 group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatINR(g.saved_amount)} / {formatINR(g.target_amount)}{daysLeft !== null ? ` · ${daysLeft}d left` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addToGoal(g.id, g.saved_amount, g.target_amount)}>+ Add</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(g.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                    className="h-full gradient-primary" />
                </div>
                <p className="text-xs text-primary font-medium">{Math.round(pct)}% complete</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
