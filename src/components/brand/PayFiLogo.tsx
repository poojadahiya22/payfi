interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}
/**
 * PayFi mark — letter "P" fused with a ₹ stroke, wrapped in an emerald gradient tile.
 */
export function PayFiLogo({ size = 40, withWordmark = false, className = "" }: Props) {
  const id = "payfi-grad";
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_18px_hsl(152_60%_45%/0.45)]">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(152, 70%, 50%)" />
            <stop offset="100%" stopColor="hsl(170, 65%, 38%)" />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${id})`} />
        <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${id}-shine)`} />
        {/* P + ₹ combined glyph: vertical stem, two ₹ cross-bars, P bowl, diagonal leg */}
        <g stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M16 13 V35" />
          <path d="M16 13 H26 a6 6 0 0 1 0 12 H16" />
          <path d="M12 18 H30" />
          <path d="M12 23 H30" />
          <path d="M18 25 L28 35" />
        </g>
      </svg>
      {withWordmark && (
        <span className="text-2xl font-bold font-display tracking-tight">
          Pay<span className="text-gradient">Fi</span>
        </span>
      )}
    </div>
  );
}