import { useMemo } from "react";

interface Props {
  score: number;
  breakdown?: { savingsRate: number; budgetCompliance: number; goalCompletion: number; consistency: number };
}

export function HealthScoreCard({ score, breakdown }: Props) {
  const { label, colorClass, ringClass } = useMemo(() => {
    if (score >= 70) return { label: "Safe", colorClass: "text-score-safe", ringClass: "score-ring-safe" };
    if (score >= 40) return { label: "Moderate", colorClass: "text-score-moderate", ringClass: "score-ring-moderate" };
    return { label: "At risk", colorClass: "text-score-danger", ringClass: "score-ring-danger" };
  }, [score]);

  const c = 2 * Math.PI * 45;
  const offset = c - (score / 100) * c;

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Financial Health Score</h3>
      <div className="flex items-center gap-5">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" className={ringClass} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={offset}
              style={{ animation: "score-fill 1.2s ease-out forwards" } as React.CSSProperties} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold font-display ${colorClass}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100 · {label}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 text-xs">
          {breakdown && (
            <>
              <Row label="Savings rate" value={`${breakdown.savingsRate}%`} />
              <Row label="Budget compliance" value={`${breakdown.budgetCompliance}%`} />
              <Row label="Goal completion" value={`${breakdown.goalCompletion}%`} />
              <Row label="Consistency" value={`${breakdown.consistency}%`} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
