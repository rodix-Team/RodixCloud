"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Store,
  Users,
  Percent,
  Package,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";

export type StatCardData = {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  iconColor?: string;
  prefix?: string;
  suffix?: string;
};

type StatCardProps = StatCardData & {
  index?: number;
};

export function StatCard({
  label,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  iconColor = "text-emerald-400",
  prefix,
  suffix,
  index = 0,
}: StatCardProps) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-neutral-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wide text-neutral-400">
          {label}
        </div>
        {Icon && (
          <div
            className={`p-2 rounded-lg bg-neutral-800/50 ${iconColor} group-hover:scale-110 transition-transform`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="relative mt-3">
        <div className="text-2xl font-semibold text-neutral-50 group-hover:text-emerald-400 transition-colors flex items-baseline gap-1">
          {prefix && <span className="text-lg text-neutral-400">{prefix}</span>}
          {value}
          {suffix && <span className="text-sm text-neutral-400">{suffix}</span>}
        </div>

        {change && (
          <div className={`mt-2 text-xs flex items-center gap-1 ${changeColors[changeType]}`}>
            {changeType === "positive" ? (
              <TrendingUp className="h-3 w-3" />
            ) : changeType === "negative" ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {change}
          </div>
        )}
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
      </div>
    </motion.div>
  );
}

type StatsGridProps = {
  stats: StatCardData[];
  columns?: 2 | 3 | 4;
};

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={stat.id} {...stat} index={index} />
      ))}
    </div>
  );
}

// Pre-defined stat configurations for common use cases
export const defaultDashboardStats: StatCardData[] = [
  {
    id: "mrr",
    label: "Monthly Revenue",
    value: "8,420",
    prefix: "$",
    change: "+18.3% vs last month",
    changeType: "positive",
    icon: DollarSign,
    iconColor: "text-emerald-400",
  },
  {
    id: "orders",
    label: "Total Orders",
    value: "156",
    change: "+12 today",
    changeType: "positive",
    icon: ShoppingCart,
    iconColor: "text-blue-400",
  },
  {
    id: "customers",
    label: "Active Customers",
    value: "1,238",
    change: "+92 new signups",
    changeType: "positive",
    icon: Users,
    iconColor: "text-purple-400",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    value: "3.2",
    suffix: "%",
    change: "+0.4% improvement",
    changeType: "positive",
    icon: Percent,
    iconColor: "text-amber-400",
  },
];

// Mini stat card for sidebar or compact views
type MiniStatProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
};

export function MiniStat({ label, value, icon: Icon }: MiniStatProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-800">
      {Icon && (
        <div className="p-2 rounded-lg bg-neutral-700/50">
          <Icon className="h-4 w-4 text-emerald-400" strokeWidth={2} />
        </div>
      )}
      <div>
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="text-sm font-semibold text-neutral-200">{value}</div>
      </div>
    </div>
  );
}
