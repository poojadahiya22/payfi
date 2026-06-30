import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { useTransactions } from "@/hooks/useFinanceData";
import { CATEGORY_COLORS, formatINR, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Transactions = () => {
  const { data: txns = [], isLoading } = useTransactions();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const allCats = ["all", ...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  const filtered = txns.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (catFilter !== "all" && t.category !== catFilter) return false;
    if (q && !(t.description?.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["transactions"] });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Transactions</h1>
        <Link to="/transactions/new">
          <Button size="sm" className="gradient-primary text-primary-foreground rounded-full">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 bg-secondary/50" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{allCats.map(c => <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card rounded-2xl divide-y divide-border">
        {isLoading ? <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p> :
          filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No transactions</p> :
          filtered.map((t) => (
            <div key={t.id} className="p-3 flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ background: `${CATEGORY_COLORS[t.category] ?? "#64748b"}22`, color: CATEGORY_COLORS[t.category] ?? "#64748b" }}>
                {t.category[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-score-safe" : "text-foreground"}`}>
                {t.type === "income" ? "+" : "−"}{formatINR(t.amount)}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/transactions/${t.id}`}><Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button></Link>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(t.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Transactions;
