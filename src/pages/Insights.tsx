import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Plus, Trash2 } from "lucide-react";
import { useTransactions, useBudgets } from "@/hooks/useFinanceData";
import { formatINR, EXPENSE_CATEGORIES } from "@/lib/categories";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Insights = () => {
  const { data: txns = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { user } = useAuth();
  const qc = useQueryClient();

  // monthly comparison
  const now = new Date();
  const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd = thisStart;
  const byCat = (start: Date, end: Date | null) => {
    const map: Record<string, number> = {};
    txns.filter(t => t.type === "expense" && new Date(t.date) >= start && (!end || new Date(t.date) < end))
      .forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return map;
  };
  const cur = byCat(thisStart, null);
  const prev = byCat(lastStart, lastEnd);

  const insights: { type: "up" | "down" | "warn" | "tip"; text: string }[] = [];
  for (const cat of new Set([...Object.keys(cur), ...Object.keys(prev)])) {
    const c = cur[cat] ?? 0, p = prev[cat] ?? 0;
    if (p > 0 && c > p * 1.15) insights.push({ type: "up", text: `${cat} spending increased by ${Math.round(((c - p) / p) * 100)}% this month.` });
    if (p > 0 && c < p * 0.85) insights.push({ type: "down", text: `Great — ${cat} spending dropped by ${Math.round(((p - c) / p) * 100)}%.` });
  }
  for (const b of budgets) {
    const spent = cur[b.category] ?? 0;
    if (spent > b.monthly_limit) insights.push({ type: "warn", text: `${b.category} budget exceeded by ${formatINR(spent - b.monthly_limit)}.` });
    else if (spent > b.monthly_limit * 0.8) insights.push({ type: "warn", text: `${b.category} budget ${Math.round((spent / b.monthly_limit) * 100)}% used.` });
  }
  const totalCur = Object.values(cur).reduce((s, v) => s + v, 0);
  const totalPrev = Object.values(prev).reduce((s, v) => s + v, 0);
  if (totalPrev > 0 && totalCur < totalPrev) {
    insights.push({ type: "tip", text: `You could save ${formatINR(totalPrev - totalCur)} this month vs last month — keep it up!` });
  }
  if (totalCur > totalPrev * 1.1 && totalPrev > 0) {
    insights.push({ type: "tip", text: `Try reducing dining out by 20% to save approximately ${formatINR((cur.Food ?? 0) * 0.2)}.` });
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h1 className="text-2xl font-bold font-display">Insights</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">This month vs last</h2>
        {insights.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
            Add a few transactions to start seeing insights.
          </div>
        ) : (
          insights.map((i, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 flex gap-3 items-start">
              {i.type === "up" && <TrendingUp className="w-5 h-5 text-score-danger shrink-0" />}
              {i.type === "down" && <TrendingDown className="w-5 h-5 text-score-safe shrink-0" />}
              {i.type === "warn" && <AlertTriangle className="w-5 h-5 text-score-moderate shrink-0" />}
              {i.type === "tip" && <Lightbulb className="w-5 h-5 text-primary shrink-0" />}
              <p className="text-sm">{i.text}</p>
            </div>
          ))
        )}
      </section>

      <BudgetsSection budgets={budgets} cur={cur} user={user} qc={qc} />
    </div>
  );
};

function BudgetsSection({ budgets, cur, user, qc }: any) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("Food");
  const [limit, setLimit] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("budgets").upsert({ user_id: user.id, category: cat, monthly_limit: parseFloat(limit) }, { onConflict: "user_id,category" });
    if (error) return toast.error(error.message);
    setOpen(false); setLimit("");
    qc.invalidateQueries({ queryKey: ["budgets"] });
  };

  const remove = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["budgets"] });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Monthly budgets</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-3 h-3 mr-1" />Budget</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Set monthly budget</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-3">
              <div><Label>Category</Label>
                <Select value={cat} onValueChange={setCat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Limit (₹)</Label><Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} required /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {budgets.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">No budgets yet.</div>
      ) : (
        budgets.map((b: any) => {
          const spent = cur[b.category] ?? 0;
          const pct = Math.min(100, (spent / b.monthly_limit) * 100);
          const over = spent > b.monthly_limit;
          return (
            <div key={b.id} className="glass-card rounded-2xl p-4 space-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{b.category}</p>
                  <p className="text-xs text-muted-foreground">{formatINR(spent)} of {formatINR(b.monthly_limit)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${over ? "text-score-danger" : "text-foreground"}`}>{Math.round(pct)}%</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => remove(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${over ? "bg-score-danger" : pct > 80 ? "bg-score-moderate" : "bg-primary"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

export default Insights;
