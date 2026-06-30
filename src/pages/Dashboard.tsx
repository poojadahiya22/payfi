import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PayFiLogo } from "@/components/brand/PayFiLogo";
import { ArrowDownRight, ArrowUpRight, Wallet, PiggyBank, Plus } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { useTransactions, useBudgets, useGoals, computeSummary, computeHealthScore } from "@/hooks/useFinanceData";
import { CATEGORY_COLORS, formatINR } from "@/lib/categories";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { data: txns = [], isLoading } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { data: goals = [] } = useGoals();

  const summary = computeSummary(txns);
  const { score, breakdown } = computeHealthScore(txns, budgets, goals);

  // monthly category breakdown
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const expenseByCat: Record<string, number> = {};
  txns.filter((t) => t.type === "expense" && new Date(t.date) >= monthStart).forEach((t) => {
    expenseByCat[t.category] = (expenseByCat[t.category] ?? 0) + t.amount;
  });
  const pieData = Object.entries(expenseByCat).map(([name, value]) => ({ name, value }));

  // last 6 months income vs expense
  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const inMo = txns.filter((t) => new Date(t.date) >= d && new Date(t.date) < end);
    months.push({
      label: d.toLocaleString("en", { month: "short" }),
      income: inMo.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: inMo.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    });
  }

  const recent = txns.slice(0, 5);

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="p-4 md:p-6 space-y-5">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
      <div>
        <PayFiLogo size={36} withWordmark />
        <p className="text-xs text-muted-foreground">
          Your money, decoded.
        </p>
      </div>
      
        <Link to="/transactions/new">
          <Button size="sm" className="gradient-primary text-primary-foreground rounded-full">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={fadeUp}><BalanceCard balance={summary.balance} /></motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <StatPill icon={ArrowDownRight} label="Income" value={summary.income} color="text-score-safe" />
        <StatPill icon={ArrowUpRight} label="Expense" value={summary.expense} color="text-score-danger" />
        <StatPill icon={PiggyBank} label="Saved" value={summary.savings} color="text-primary" />
      </motion.div>

      <motion.div variants={fadeUp}><HealthScoreCard score={score} breakdown={breakdown} /></motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Income vs Expense (6 months)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="income" fill="hsl(var(--score-safe))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--score-danger))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {pieData.length > 0 && (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">This month's spending</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {pieData.map((d) => <Cell key={d.name} fill={CATEGORY_COLORS[d.name] ?? "#64748b"} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[d.name] ?? "#64748b" }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium">{formatINR(d.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent transactions</h3>
          <Link to="/transactions" className="text-xs text-primary">See all</Link>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <Wallet className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No transactions yet. Add your first one.</p>
            <Link to="/transactions/new"><Button size="sm" variant="outline">Add transaction</Button></Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((t) => (
              <li key={t.id} className="py-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ background: `${CATEGORY_COLORS[t.category] ?? "#64748b"}22`, color: CATEGORY_COLORS[t.category] ?? "#64748b" }}>
                  {t.category[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === "income" ? "text-score-safe" : "text-foreground"}`}>
                  {t.type === "income" ? "+" : "−"}{formatINR(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
};

function StatPill({ icon: Icon, label, value, color }: any) {
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{formatINR(value)}</p>
    </div>
  );
}

export default Dashboard;
