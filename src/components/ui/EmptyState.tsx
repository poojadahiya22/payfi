import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
}
export function EmptyState({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-10 text-center flex flex-col items-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-[0_10px_30px_-10px_hsl(152_60%_45%/0.6)]">
          <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
