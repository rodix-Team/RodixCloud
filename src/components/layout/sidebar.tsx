"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useT } from "@/i18n/useT";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function Sidebar() {
  const pathname = usePathname();
  const t = useT();

  const mainNav: NavItem[] = [
    {
      label: t("nav.overview"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("nav.stores"),
      href: "/dashboard/stores",
      icon: Store,
    },
    {
      label: t("nav.customers"),
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      label: t("nav.billing"),
      href: "/dashboard/billing",
      icon: CreditCard,
    },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-950/95 text-neutral-200">
      {/* Logo + اسم المنصة */}
      <div className="flex h-16 items-center gap-3 border-b border-neutral-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/90 text-sm font-black text-neutral-950">
          RX
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide">
            Rodix Cloud
          </span>
          <span className="text-[11px] text-neutral-400">
            E-commerce Control Center
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 px-3 py-4">
        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Dashboard
          </p>
          <ul className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors " +
                      (isActive
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-50")
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Analytics
          </p>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-50"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{t("nav.analytics")}</span>
          </Link>
        </div>
      </nav>

      {/* Plan box في الأسفل */}
      <div className="border-t border-neutral-800 px-3 py-4">
        <div className="rounded-xl bg-neutral-900/80 px-3 py-3 text-xs text-neutral-300">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Plan
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              Growth
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            14-day free trial · then{" "}
            <span className="font-semibold">199$/mo</span>.
          </p>
        </div>
      </div>
    </aside>
  );
}
