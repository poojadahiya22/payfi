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
  <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg">
    {/* Background glow */}
    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-emerald-200/10 blur-3xl" />

    <div className="relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            Net Balance
          </p>

          <div className="mt-3 min-h-[42px]">
            <AnimatePresence mode="wait">
              {revealed ? (
                <motion.span
                  key="bal"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="block text-4xl font-bold tracking-tight font-display tabular-nums"
                >
                  {formatINR(balance)}
                </motion.span>
              ) : (
                <motion.span
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="block text-4xl font-bold tracking-tight font-display"
                >
                  ₹ XX,XXX
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() =>
            revealed ? setRevealed(false) : setEntering(true)
          }
          aria-label={revealed ? "Hide balance" : "Show balance"}
          className="rounded-full border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
        <div>
          <p className="text-[11px] text-white/60">Available balance</p>
          <p className="mt-0.5 text-xs font-medium text-white/90">
            Updated from your transactions
          </p>
        </div>

        <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">
          Personal finance
        </div>
      </div>

      <AnimatePresence>
        {entering && !revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5"
          >
            <p className="mb-2 text-xs text-white/70">
              Enter PIN to reveal
            </p>

            <div
              className={`mb-3 flex gap-2 ${
                error ? "animate-pulse" : ""
              }`}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-bold ${
                    error ? "ring-2 ring-red-300" : ""
                  }`}
                >
                  {digits[i] ? "•" : ""}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
                (k, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      k === "⌫"
                        ? setDigits((d) => d.slice(0, -1))
                        : k && onDigit(k)
                    }
                    disabled={!k}
                    className={`h-10 rounded-lg font-medium transition ${
                      k
                        ? "bg-white/10 hover:bg-white/20 active:scale-95"
                        : "invisible"
                    }`}
                  >
                    {k}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
