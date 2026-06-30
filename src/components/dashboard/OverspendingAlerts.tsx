import { AlertTriangle, TrendingUp } from "lucide-react";

const alerts = [
  {
    category: "Shopping",
    currentSpend: 8240,
    lastMonthSpend: 5100,
    increasePercent: 62,
    severity: "high" as const,
  },
  {
    category: "Food & Drinks",
    currentSpend: 5600,
    lastMonthSpend: 4800,
    increasePercent: 17,
    severity: "low" as const,
  },
];

export function OverspendingAlerts() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-muted-foreground">Overspending Alerts</h3>
        <AlertTriangle className="h-4 w-4 text-score-moderate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.category}
            className={`p-4 rounded-xl border ${
              alert.severity === "high"
                ? "border-destructive/30 bg-destructive/5"
                : "border-score-moderate/30 bg-score-moderate/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{alert.category}</span>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                alert.severity === "high" ? "text-destructive" : "text-score-moderate"
              }`}>
                <TrendingUp className="h-3 w-3" />
                +{alert.increasePercent}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This month: ₹{alert.currentSpend.toLocaleString("en-IN")}</span>
              <span>Last month: ₹{alert.lastMonthSpend.toLocaleString("en-IN")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Future prediction */}
      <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-1">📊 Next Month Prediction</p>
        <p className="text-sm font-semibold">Projected Spending: ₹24,800</p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on your 3-month spending trend. Consider reducing discretionary expenses.
        </p>
      </div>
    </div>
  );
}
