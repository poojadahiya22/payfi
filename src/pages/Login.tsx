import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PayFiLogo } from "@/components/brand/PayFiLogo";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  //const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
}

  //if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate("/dashboard");
  };

  const handleGoogle = async () => {
    const {error} = await supabase.auth.signInWithOAuth({provider: "google",
      options:{
      redirectTo:   window.location.origin
      },
    });
    if (error) {
      toast.error("Google sign-in failed");
    }
  };
  
  return (
  <div className="min-h-screen bg-background">
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* Left Side */}
      <AuthShowcase />

      {/* Right Side */}
      <div className="flex items-center justify-center p-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8 w-full max-w-md space-y-6"
        >

          {/* Top Link */}
          <div className="flex justify-end">
            <Link
              to="/register"
              className="text-sm text-muted-foreground"
            >
              New here?
              <span className="text-primary font-medium">
                {" "}Create Account
              </span>
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <PayFiLogo size={48} withWordmark />
            </div>

            <p className="text-sm text-muted-foreground">
              Your Financial Intelligence Engine
            </p>
          </div>

          {/* Keep your existing form here */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className="h-12 bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="h-12 bg-secondary/50 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold rounded-xl">
              {busy ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Keep your OR divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Keep your Google button */}
          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-12 rounded-xl">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </Button>
        </motion.div>
        </div>
        </div>
        </div>
);
};
export default Login;
