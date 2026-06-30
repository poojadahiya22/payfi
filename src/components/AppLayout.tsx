import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, Sparkles, Target, User, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppLayout() {
  const location = useLocation();
  const isChat = location.pathname.startsWith("/chat");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-24 max-w-2xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Floating AI button */}
      {!isChat && (
        <NavLink
          to="/chat"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
          aria-label="PayFi AI"
        >
          <MessageCircle className="w-6 h-6" />
        </NavLink>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 h-0.5 w-10 rounded-full bg-primary"
                    />
                  )}
                  <t.icon className="w-5 h-5" />
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
