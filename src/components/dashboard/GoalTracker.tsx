import { Target, TrendingUp, AlertTriangle } from "lucide-react";

const goals = [
  {
    name: "Buy Laptop",
    target: 60000,
    saved: 38400,
    daysRemaining: 45,
    dailyRequired: 480,
    onTrack: true,
  },
  {
    name: "Emergency Fund",
    target: 100000,
    saved: 52000,
    daysRemaining: 120,
    dailyRequired: 400,
    onTrack: false,
  },
];

export function GoalTracker() {
  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-muted-foreground">Smart Goals</h3>
        <Target className="h-4 w-4 text-primary" />
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const percent = Math.round((goal.saved / goal.target) * 100);
          return (
            <div key={goal.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{goal.saved.toLocaleString("en-IN")} / ₹{goal.target.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  goal.onTrack
                    ? "bg-accent text-accent-foreground"
                    : "bg-score-moderate/15 text-score-moderate"
                }`}>
                  {goal.onTrack ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {goal.onTrack ? "On Track" : "Behind"}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    goal.onTrack ? "gradient-primary" : "bg-score-moderate"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.daysRemaining} days left</span>
                <span>Save ₹{goal.dailyRequired}/day</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestion */}
      <div className="mt-5 p-3 rounded-xl bg-accent/30 border border-accent/50">
        <p className="text-xs text-accent-foreground">
          💡 <strong>Tip:</strong> Reduce dining expenses by 15% to stay on track for your Emergency Fund goal.
        </p>
      </div>
    </div>
  );
}
