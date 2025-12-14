"use client";

import { motion } from "framer-motion";

/**
 * Spinner بسيط
 */
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500`}
    />
  );
}

/**
 * Loading Screen كامل للصفحة
 */
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative">
          {/* Outer ring */}
          <div className="h-16 w-16 rounded-full border-4 border-neutral-800" />
          {/* Spinning ring */}
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-500 font-bold text-sm">RX</span>
          </div>
        </div>
        <p className="mt-4 text-neutral-400 text-sm">{message}</p>
      </motion.div>
    </div>
  );
}

/**
 * Skeleton Loading للـ Cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 animate-pulse">
      <div className="h-3 w-24 bg-neutral-700 rounded mb-3" />
      <div className="h-8 w-20 bg-neutral-700 rounded mb-2" />
      <div className="h-3 w-32 bg-neutral-800 rounded" />
    </div>
  );
}

/**
 * Skeleton للـ Stats Cards (4 cards)
 */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton للـ Chart
 */
export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 animate-pulse ${height}`}
    >
      <div className="h-3 w-32 bg-neutral-700 rounded mb-2" />
      <div className="h-2 w-24 bg-neutral-800 rounded mb-4" />
      <div className="flex-1 flex items-end gap-2 h-[calc(100%-60px)]">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-neutral-800 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton للـ Table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden animate-pulse">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4 flex gap-4">
        <div className="h-3 w-20 bg-neutral-700 rounded" />
        <div className="h-3 w-32 bg-neutral-700 rounded" />
        <div className="h-3 w-24 bg-neutral-700 rounded" />
        <div className="h-3 w-16 bg-neutral-700 rounded" />
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-neutral-800/50 p-4 flex gap-4">
          <div className="h-3 w-20 bg-neutral-800 rounded" />
          <div className="h-3 w-32 bg-neutral-800 rounded" />
          <div className="h-3 w-24 bg-neutral-800 rounded" />
          <div className="h-3 w-16 bg-neutral-800 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton للـ Sidebar
 */
export function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-neutral-800 bg-neutral-950/90 p-4 animate-pulse">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-neutral-700" />
        <div>
          <div className="h-3 w-20 bg-neutral-700 rounded mb-1" />
          <div className="h-2 w-28 bg-neutral-800 rounded" />
        </div>
      </div>
      {/* Nav items */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-neutral-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({
  message = "Processing...",
}: {
  message?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-neutral-300">{message}</p>
      </div>
    </motion.div>
  );
}
