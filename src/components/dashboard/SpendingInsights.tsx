import { TrendingUp, ShoppingBag, Coffee, Repeat } from "lucide-react";

const insights = [
  {
    icon: ShoppingBag,
    label: "Top Category",
    value: "Shopping",
    detail: "₹8,240 this month",
  },
  {
    icon: Coffee,
    label: "Most Frequent",
    value: "Food & Drinks",
    detail: "34 transactions",
  },
  {
    icon: TrendingUp,
    label: "Monthly Trend",
    value: "+12%",
    detail: "vs last month",
  },
  {
    icon: Repeat,
    label: "Recurring",
    value: "₹4,500",
    detail: "5 subscriptions",
  },
];

const categoryBreakdown = [
  { name: "Shopping", amount: 8240, percent: 37, color: "bg-primary" },
  { name: "Food", amount: 5600, percent: 25, color: "bg-score-moderate" },
  { name: "Transport", amount: 3200, percent: 14, color: "bg-chart-4" },
  { name: "Entertainment", amount: 2800, percent: 13, color: "bg-chart-5" },
  { name: "Others", amount: 2309, percent: 11, color: "bg-muted-foreground" },
];

export function SpendingInsights() {
  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-5">AI Spending Insights</h3>

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {insights.map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-secondary/50 space-y-1">
            <item.icon className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-semibold text-sm">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground">Category Breakdown</p>
        {categoryBreakdown.map((cat) => (
          <div key={cat.name} className="flex items-center gap-3">
            <span className="text-xs w-24 text-muted-foreground truncate">{cat.name}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color}`}
                style={{ width: `${cat.percent}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">{cat.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
