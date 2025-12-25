"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./Header";
import { ErrorBoundary } from "@/components/error-boundary";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

/**
 * Dashboard Layout الرئيسي
 * يحتوي على Sidebar + Header + Content Area
 */
export function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle = "Overview",
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader title={title} subtitle={subtitle} />

        {/* Page Content with Error Boundary */}
        <ErrorBoundary>
          <section className="flex-1 p-6 overflow-auto">{children}</section>
        </ErrorBoundary>
      </main>
    </div>
  );
}

/**
 * Dashboard Content Section
 * للـ sections داخل الصفحة
 */
type DashboardSectionProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function DashboardSection({
  children,
  title,
  subtitle,
  action,
  className = "",
}: DashboardSectionProps) {
  return (
    <div
      className={`bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <div className="text-sm font-medium text-neutral-200">{title}</div>
            )}
            {subtitle && (
              <div className="text-xs text-neutral-500">{subtitle}</div>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Dashboard Grid
 * للـ layouts المختلفة
 */
type DashboardGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
};

export function DashboardGrid({
  children,
  columns = 2,
  gap = "md",
}: DashboardGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  };

  const gapClass = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div className={`grid ${colsClass[columns]} ${gapClass[gap]}`}>
      {children}
    </div>
  );
}

/**
 * Dashboard Page Header
 * للعناوين الرئيسية في الصفحات
 */
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-neutral-300 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-neutral-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-100">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
