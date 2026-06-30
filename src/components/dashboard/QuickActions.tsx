import { QrCode, Send, Building2, Smartphone, Zap, CreditCard } from "lucide-react";

const actions = [
  { label: "Scan QR", icon: QrCode, color: "text-primary" },
  { label: "Send Money", icon: Send, color: "text-primary" },
  { label: "Bank Transfer", icon: Building2, color: "text-primary" },
  { label: "Recharge", icon: Smartphone, color: "text-primary" },
  { label: "Pay Bills", icon: Zap, color: "text-primary" },
  { label: "Cards", icon: CreditCard, color: "text-primary" },
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center group-hover:bg-accent transition-colors">
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
