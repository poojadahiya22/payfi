import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Moon,
  Sun,
  WalletCards,
  PiggyBank,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Financial preferences
  const [currency, setCurrency] = useState("INR");
  const [monthlyIncome, setMonthlyIncome] = useState("0");
  const [savingsTarget, setSavingsTarget] = useState("0");
  const [defaultCategory, setDefaultCategory] = useState("Food");

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [saving, setSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [financials, setFinancials] = useState({
  income: 0,
  expenses: 0,
  savings: 0,
  savingsRate: 0,
});

  useEffect(() => {
    //existing profile loading code
    if (!user) return;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.full_name ?? "");
          setPhone(data.phone ?? "");

          setCurrency(data.currency ?? "INR");
          setMonthlyIncome(String(data.monthly_income ?? 0));
          setSavingsTarget(String(data.savings_target ?? 0));
          setDefaultCategory(data.default_category ?? "Food");
        }
      });
  }, [user]);
  
  useEffect(() => {
    //financial snapshot code
  if (!user) return;

  const loadFinancials = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("date,type,amount");
      .eq("user_id",user.id);

    if (error) {
      console.error("Failed to load financial summary:", error);
      return;
    }

    const now = new Date();

    const currentMonthTransactions = (data ?? []).filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const income = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savings = income - expenses;

    const savingsRate =
      income > 0 ? Math.round((savings / income) * 100) : 0;

    setFinancials({
      income,
      expenses,
      savings,
      savingsRate,
    });
  };

  loadFinancials();
}, [user]);

  const save = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      phone,
    });

    setSaving(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Profile updated");
  };

  const savePreferences = async () => {
    if (!user) return;

    const income = Number(monthlyIncome);
    const savings = Number(savingsTarget);

    if (income < 0 || savings < 0) {
      return toast.error("Amounts cannot be negative");
    }

    if (savings > income && income > 0) {
      return toast.error(
        "Savings target cannot be greater than monthly income"
      );
    }

    setSavingPreferences(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        currency,
        monthly_income: income,
        savings_target: savings,
        default_category: defaultCategory,
      });

    setSavingPreferences(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Financial preferences saved");
  };

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("payfi_theme", v ? "dark" : "light");
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const exportCSV = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("date,type,category,amount,description")
      .order("date", { ascending: false });

    if (!data) return;

    const csv = [
      "date,type,category,amount,description",
      ...data.map(
        (r: any) =>
          `${r.date},${r.type},${r.category},${r.amount},"${(
            r.description ?? ""
          ).replace(/"/g, '""')}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payfi-transactions.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold font-display">Profile</h1>

      {/* Personal Information */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {(name || user?.email || "?")[0].toUpperCase()}
          </div>

          <div>
            <p className="font-semibold">{name || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <div>
          <Label>Full name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Button
          onClick={save}
          disabled={saving}
          className="w-full gradient-primary text-primary-foreground"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

{/* Financial Snapshot */}

<div className="glass-card rounded-2xl p-5 space-y-4">
  <div>
    <h2 className="font-semibold flex items-center gap-2">
      <WalletCards className="w-5 h-5" />
      Financial Snapshot
    </h2>

    <p className="text-xs text-muted-foreground">
      Your financial activity for this month
    </p>
  </div>

  <div className="grid grid-cols-2 gap-3">

    {/* Income */}
    <div className="rounded-xl border border-border/50 p-4">
      <p className="text-xs text-muted-foreground">
        💰 Income
      </p>

      <p className="text-lg font-bold mt-2">
        ₹{financials.income.toLocaleString("en-IN")}
      </p>
    </div>

    {/* Expenses */}
    <div className="rounded-xl border border-border/50 p-4">
      <p className="text-xs text-muted-foreground">
        💸 Expenses
      </p>

      <p className="text-lg font-bold mt-2">
        ₹{financials.expenses.toLocaleString("en-IN")}
      </p>
    </div>

    {/* Savings */}
    <div className="rounded-xl border border-border/50 p-4">
      <p className="text-xs text-muted-foreground">
        🐷 Savings
      </p>

      <p className="text-lg font-bold mt-2">
        ₹{financials.savings.toLocaleString("en-IN")}
      </p>
    </div>

    {/* Savings Rate */}
    <div className="rounded-xl border border-border/50 p-4">
      <p className="text-xs text-muted-foreground">
        📈 Savings Rate
      </p>

      <p className="text-lg font-bold mt-2">
        {financials.savingsRate}%
      </p>
    </div>

  </div>
</div>

{/* Financial Preferences */}

<div className="glass-card rounded-2xl p-5 space-y-4">

  <div>
    <h2 className="font-semibold flex items-center gap-2">
      <PiggyBank className="w-5 h-5" />
      Financial Preferences
    </h2>

    <p className="text-xs text-muted-foreground">
      Customize your budgeting preferences
    </p>
  </div>
</div>

  {/* Currency */}
        <div className="space-y-1.5">
          <Label>Currency</Label>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="INR">₹ INR — Indian Rupee</option>
            <option value="USD">$ USD — US Dollar</option>
            <option value="EUR">€ EUR — Euro</option>
            <option value="GBP">£ GBP — British Pound</option>
          </select>
        </div>

        {/* Monthly Income */}
        <div className="space-y-1.5">
          <Label>Monthly Income</Label>

          <Input
            type="number"
            min="0"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="e.g. 20000"
          />
        </div>

        {/* Savings Target */}
        <div className="space-y-1.5">
          <Label>Monthly Savings Target</Label>

          <div className="relative">
            <PiggyBank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              type="number"
              min="0"
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              placeholder="e.g. 5000"
              className="pl-9"
            />
          </div>
        </div>

        {/* Default Category */}
        <div className="space-y-1.5">
          <Label>Default Expense Category</Label>

          <select
            value={defaultCategory}
            onChange={(e) => setDefaultCategory(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
      
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Button
          onClick={savePreferences}
          disabled={savingPreferences}
          className="w-full gradient-primary text-primary-foreground">
          {savingPreferences ? "Saving..." : "Save Preferences"}
        </Button>
    </div>

      {/* Appearance & Data */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dark ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}

            <span className="text-sm">Dark mode</span>
          </div>

          <Switch
            checked={dark}
            onCheckedChange={toggleTheme}/>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={exportCSV}>
          Export transactions (CSV)
        </Button>
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-destructive border-destructive/30"
        onClick={onSignOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
};

export default Profile;
