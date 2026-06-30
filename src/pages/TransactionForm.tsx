import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";

const TransactionForm = () => {
  const { id } = useParams();
  const editing = id && id !== "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      supabase.from("transactions").select("*").eq("id", id!).maybeSingle().then(({ data }) => {
        if (data) {
          setType(data.type as any);
          setAmount(String(data.amount));
          setCategory(data.category);
          setDescription(data.description ?? "");
          setDate(data.date);
        }
      });
    }
  }, [id, editing]);

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    const payload = { user_id: user.id, type, amount: n, category, description: description || null, date };
    const { error } = editing
      ? await supabase.from("transactions").update(payload).eq("id", id!)
      : await supabase.from("transactions").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    qc.invalidateQueries({ queryKey: ["transactions"] });
    navigate("/transactions");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-muted-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold font-display">{editing ? "Edit" : "Add"} Transaction</h1>

      <form onSubmit={onSubmit} className="glass-card rounded-2xl p-5 space-y-4">
        <Tabs value={type} onValueChange={(v) => { setType(v as any); setCategory(v === "income" ? "Salary" : "Food"); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input type="number" inputMode="decimal" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" required />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>{cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" required />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" rows={2} />
        </div>

        <Button type="submit" disabled={busy} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
          {busy ? "Saving…" : editing ? "Save changes" : "Add transaction"}
        </Button>
      </form>
    </div>
  );
};

export default TransactionForm;
