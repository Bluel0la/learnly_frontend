import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: number | null;
  deltaLabel?: string;
  accentColor?: "blue" | "green" | "red" | "purple";
  className?: string;
}

const ACCENTS: Record<string, { tile: string; text: string }> = {
  blue: {
    tile: "bg-luminous-secondary-container/10 border-luminous-secondary-container/30 text-luminous-secondary",
    text: "text-luminous-secondary",
  },
  green: {
    tile: "bg-emerald-500/10 border-emerald-400/30 text-emerald-400",
    text: "text-emerald-400",
  },
  red: {
    tile: "bg-rose-500/10 border-rose-400/30 text-rose-400",
    text: "text-rose-400",
  },
  purple: {
    tile: "bg-luminous-primary-container/15 border-luminous-primary/30 text-luminous-primary",
    text: "text-luminous-primary",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  delta,
  deltaLabel,
  accentColor = "blue",
  className = "",
}) => {
  const accent = ACCENTS[accentColor] ?? ACCENTS.blue;
  const getDeltaSymbol = () => {
    if (delta == null) return "—";
    if (delta > 0) return <span className="text-emerald-400 mr-1">▲</span>;
    if (delta < 0) return <span className="text-rose-400 mr-1">▼</span>;
    return <span className="text-slate-500 mr-1">—</span>;
  };
  const getDeltaClass = () => {
    if (delta == null) return "text-slate-500";
    if (delta > 0) return "text-emerald-400";
    if (delta < 0) return "text-rose-400";
    return "text-slate-500";
  };

  return (
    <div
      className={`rounded-xl luminous-glass-card border-white/10 p-4 lg:p-6 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1 flex items-center gap-1 text-slate-400">
            {icon} {label}
          </p>
          <p className="text-2xl lg:text-3xl font-bold font-display text-white">{value}</p>
          {typeof delta !== "undefined" && (
            <p className={`mt-2 text-xs font-semibold flex items-center ${getDeltaClass()}`}>
              {getDeltaSymbol()} {typeof delta === "number" ? Math.abs(delta) : ""} {deltaLabel}
            </p>
          )}
        </div>
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${accent.tile}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
