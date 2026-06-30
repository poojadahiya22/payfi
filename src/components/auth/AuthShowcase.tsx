import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee, Wallet, PiggyBank, Coins, CreditCard, LineChart, TrendingUp, Sparkles } from "lucide-react";
import heroImg from "@/assets/auth-finance-hero.png";
const QUOTES = [
  "Track every rupee. Build every dream.",
  "Small savings create big futures.",
  "Financial freedom starts today.",
  "Know where your money goes.",
  "Budget smart. Live better.",
];
const FLOATERS = [
  { Icon: IndianRupee, x: "8%", y: "12%", size: 22, delay: 0 },
  { Icon: Wallet, x: "82%", y: "18%", size: 26, delay: 0.6 },
  { Icon: PiggyBank, x: "12%", y: "70%", size: 28, delay: 1.2 },
  { Icon: Coins, x: "88%", y: "62%", size: 22, delay: 1.8 },
  { Icon: CreditCard, x: "20%", y: "40%", size: 24, delay: 2.4 },
  { Icon: LineChart, x: "78%", y: "82%", size: 24, delay: 3.0 },
  { Icon: TrendingUp, x: "50%", y: "8%", size: 20, delay: 3.6 },
  { Icon: Sparkles, x: "55%", y: "92%", size: 18, delay: 4.2 },
];
export function AuthShowcase() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative hidden lg:flex w-full h-full items-center justify-center overflow-hidden">
      {/* ambient gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(152_60%_30%/0.35),transparent_55%),radial-gradient(circle_at_75%_80%,hsl(170_60%_28%/0.3),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(228_15%_7%/0.85),hsl(225_15%_11%/0.6))]" />
      {/* floating finance icons */}
      {FLOATERS.map(({ Icon, x, y, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/15"
          style={{ left: x, top: y }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-10, 10, -10], opacity: 0.18 }}
          transition={{ y: { duration: 6 + (i % 3), repeat: Infinity, ease: "easeInOut", delay }, opacity: { duration: 1, delay } }}
        >
          <Icon style={{ width: size, height: size }} strokeWidth={1.5} />
        </motion.div>
      ))}
      {/* glow ring behind illustration */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-primary/20 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-xl">
        <motion.img
          src={heroImg}
          alt="Smart personal finance for students"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-[420px] max-w-full rounded-3xl shadow-[0_30px_80px_-20px_hsl(152_60%_30%/0.45)] mb-8 select-none pointer-events-none"
          draggable={false}
        />
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="text-xl font-display font-semibold text-foreground/90"
            >
              "{QUOTES[idx]}"
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-4 flex gap-1.5">
          {QUOTES.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === idx ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
