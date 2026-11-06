import { Icon, type IconName } from "../ui/Icon";

export function StatCard({
  label = "Metric",
  value = "--",
  delta = "+0.0%",
  subtext = "",
  icon = "activity",
  variant = "blue",
  chart = "M0 30 L96 30",
}: {
  label?: string;
  value?: string;
  delta?: string;
  subtext?: string;
  icon?: IconName;
  variant?: string;
  chart?: string;
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${variant}`}>
        <Icon name={icon} size={18} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-white">{value}</p>
        </div>
        <svg
          className="mb-1 h-10 w-24 overflow-visible"
          viewBox="0 0 96 40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity=".24" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${chart} L96 40 L0 40 Z`} fill={`url(#gradient-${variant})`} stroke="none" />
          <path
            d={chart}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3">
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
          <Icon name="trend" size={11} />
          {delta}
        </span>
        <span className="text-[10px] text-slate-600">{subtext}</span>
      </div>
    </article>
  );
}
