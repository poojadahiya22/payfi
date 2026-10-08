import { useMemo } from "react";
import type { CSSProperties } from "react";

interface Props {
  score: number;
  breakdown?: {
    savingsRate: number;
    budgetCompliance: number;
    goalCompletion: number;
    consistency: number;
  };
}

interface MetricRowProps {
  label: string;
  value: number;
}

const MetricRow = ({ label, value }: MetricRowProps) => {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {label}
        </span>

        <span className="text-xs font-semibold">
          {safeValue}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

export function HealthScoreCard({ score, breakdown }: Props) {
  const { label, colorClass, ringClass } = useMemo(() => {
    if (score >= 70) {
      return {
        label: "Safe",
        colorClass: "text-score-safe",
        ringClass: "score-ring-safe",
      };
    }

    if (score >= 40) {
      return {
        label: "Moderate",
        colorClass: "text-score-moderate",
        ringClass: "score-ring-moderate",
      };
    }

    return {
      label: "At risk",
      colorClass: "text-score-danger",
      ringClass: "score-ring-danger",
    };
  }, [score]);

  const safeScore = Math.min(Math.max(score, 0), 100);

  const circumference = 2 * Math.PI * 45;
  const offset =
    circumference - (safeScore / 100) * circumference;

  return (
    <div className="glass-card overflow-hidden rounded-3xl border border-border/50 p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Financial wellness
          </p>

          <h3 className="mt-1 text-base font-semibold">
            Financial Health
          </h3>
        </div>

        <div
          className={`rounded-full bg-background/70 px-3 py-1 text-[10px] font-medium ${colorClass}`}
        >
          {label}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg
            className="h-28 w-28 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="6"
            />

            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={ringClass}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={
                {
                  transition:
                    "stroke-dashoffset 900ms ease-out",
                } as CSSProperties
              }
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-display text-3xl font-bold ${colorClass}`}
            >
              {safeScore}
            </span>

            <span className="text-[10px] text-muted-foreground">
              out of 100
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {breakdown && (
            <>
              <MetricRow
                label="Savings"
                value={breakdown.savingsRate}
              />

              <MetricRow
                label="Budget"
                value={breakdown.budgetCompliance}
              />

              <MetricRow
                label="Goals"
                value={breakdown.goalCompletion}
              />

              <MetricRow
                label="Consistency"
                value={breakdown.consistency}
              />
            </>
          )}
        </div>
      </div>

      {breakdown && (
        <div className="mt-5 rounded-2xl bg-background/50 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {breakdown.savingsRate >= 70
              ? "Great job — you're building a strong savings habit."
              : "Focus on saving a little more consistently each month."}
          </p>
        </div>
      )}
    </div>
  );
}
