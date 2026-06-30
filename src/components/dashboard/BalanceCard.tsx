import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { formatINR } from "@/lib/categories";

const PIN = "1234"; // simulated

export function BalanceCard({ balance }: { balance: number }) {
  const [revealed, setRevealed] = useState(false);
  const [entering, setEntering] = useState(false);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  const onDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setError(false);
    if (next.length === 4) {
      if (next === PIN) {
        setRevealed(true);
        setEntering(false);
        setDigits("");
      } else {
        setError(true);
        setTimeout(() => { setDigits(""); setError(false); }, 600);
      }
    }
  };

  return (
    <div className="relative rounded-2xl p-5 overflow-hidden text-white" style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(160 70% 35%) 100%)" }}>
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">Net Balance</p>
          <div className="mt-2 h-10 flex items-center">
            <AnimatePresence mode="wait">
              {revealed ? (
                <motion.span key="bal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-3xl font-bold font-display tabular-nums">{formatINR(balance)}</motion.span>
              ) : (
                <motion.span key="hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-3xl font-bold font-display tracking-widest">₹ XX,XXX</motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button onClick={() => revealed ? setRevealed(false) : setEntering(true)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20">
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {entering && !revealed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-4">
            <p className="text-xs opacity-80 mb-2">Enter PIN to reveal (demo: 1234)</p>
            <div className={`flex gap-2 mb-3 ${error ? "animate-pulse" : ""}`}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg ${error ? "ring-2 ring-red-300" : ""}`}>
                  {digits[i] ? "•" : ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
                <button key={i} onClick={() => k === "⌫" ? setDigits(d => d.slice(0, -1)) : k && onDigit(k)}
                  disabled={!k}
                  className={`h-10 rounded-lg font-medium ${k ? "bg-white/15 hover:bg-white/25" : "invisible"}`}>
                  {k}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
