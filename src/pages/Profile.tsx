import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
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
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setName(data.full_name ?? ""); setPhone(data.phone ?? ""); }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: name, phone });
    if (error) return toast.error(error.message);
    toast.success("Saved");
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
    const { data } = await supabase.from("transactions").select("date,type,category,amount,description").order("date", { ascending: false });
    if (!data) return;
    const csv = ["date,type,category,amount,description", ...data.map((r: any) => `${r.date},${r.type},${r.category},${r.amount},"${(r.description ?? "").replace(/"/g, '""')}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payfi-transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold font-display">Profile</h1>

      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {(name || user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{name || "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <Button onClick={save} className="w-full gradient-primary text-primary-foreground">Save</Button>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">Dark mode</span>
          </div>
          <Switch checked={dark} onCheckedChange={toggleTheme} />
        </div>
        <Button variant="outline" className="w-full" onClick={exportCSV}>Export transactions (CSV)</Button>
      </div>

      <Button variant="outline" className="w-full text-destructive border-destructive/30" onClick={onSignOut}>
        <LogOut className="w-4 h-4 mr-2" /> Sign out
      </Button>
    </div>
  );
};

export default Profile;
