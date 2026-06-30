import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string | null;
  date: string;
  created_at: string;
};

export type Budget = {
  id: string;
  category: string;
  monthly_limit: number;
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
};

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((t: any) => ({ ...t, amount: Number(t.amount) }));
    },
  });
}

export function useBudgets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["budgets", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase.from("budgets").select("*").order("category");
      if (error) throw error;
      return (data ?? []).map((b: any) => ({ ...b, monthly_limit: Number(b.monthly_limit) }));
    },
  });
}

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((g: any) => ({
        ...g,
        target_amount: Number(g.target_amount),
        saved_amount: Number(g.saved_amount),
      }));
    },
  });
}

export function computeSummary(txns: Transaction[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthly = txns.filter((t) => new Date(t.date) >= monthStart);
  const income = monthly.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthly.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savings = income - expense;
  return { income, expense, balance, savings, totalIncome, totalExpense };
}

export function computeHealthScore(
  txns: Transaction[],
  budgets: Budget[],
  goals: Goal[]
): { score: number; breakdown: { savingsRate: number; budgetCompliance: number; goalCompletion: number; consistency: number } } {
  const { income, expense } = computeSummary(txns);

  // savings rate
  const savingsRate = income > 0 ? Math.max(0, Math.min(1, (income - expense) / income)) : 0;

  // budget compliance
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let compliant = 0;
  let total = 0;
  for (const b of budgets) {
    total++;
    const spent = txns
      .filter((t) => t.type === "expense" && t.category === b.category && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0);
    if (spent <= b.monthly_limit) compliant++;
  }
  const budgetCompliance = total ? compliant / total : 0.7;

  // goal completion
  const goalCompletion = goals.length
    ? Math.min(1, goals.reduce((s, g) => s + g.saved_amount / g.target_amount, 0) / goals.length)
    : 0.5;

  // consistency: stddev of last 6 months' expenses (lower = better)
  const months: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[`${d.getFullYear()}-${d.getMonth()}`] = 0;
  }
  for (const t of txns) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k in months) months[k] += t.amount;
  }
  const vals = Object.values(months);
  const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length || 1);
  const stddev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 1 - stddev / mean) : 0.5;

  const score = Math.round(
    (savingsRate * 0.35 + budgetCompliance * 0.25 + goalCompletion * 0.2 + consistency * 0.2) * 100
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      savingsRate: Math.round(savingsRate * 100),
      budgetCompliance: Math.round(budgetCompliance * 100),
      goalCompletion: Math.round(goalCompletion * 100),
      consistency: Math.round(consistency * 100),
    },
  };
}
