export const EXPENSE_CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Investment",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelancing", "Investment", "Other"] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316",
  Shopping: "#ec4899",
  Travel: "#3b82f6",
  Bills: "#ef4444",
  Entertainment: "#a855f7",
  Health: "#14b8a6",
  Education: "#eab308",
  Investment: "#10b981",
  Salary: "#10b981",
  Freelancing: "#8b5cf6",
  Other: "#64748b",
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
