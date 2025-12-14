"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
  Palette,
  HelpCircle,
  FolderTree,
  LucideIcon,
  Megaphone,
} from "lucide-react";
import { useAuthStore } from "@/store/app-store";
import { setAuthToken, http } from "@/lib/http";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
};

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Real counts from backend
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Fetch real counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch products count
        const productsRes = await http.get("/products?page=1");
        setProductCount(productsRes.data.total || 0);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }

      try {
        // Fetch orders count (pending orders)
        const ordersRes = await http.get("/orders?page=1");
        setOrderCount(ordersRes.data.total || 0);
      } catch (error) {
        // Orders endpoint might not exist yet
        setOrderCount(0);
      }
    };

    fetchCounts();
  }, []);

  // Dynamic navigation with real counts
  const navigation: NavSection[] = useMemo(() => [
    {
      title: "Dashboard",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Store",
      items: [
        {
          label: "Products",
          href: "/dashboard/products",
          icon: Package,
          badge: productCount !== null ? productCount : undefined,
        },
        {
          label: "Categories",
          href: "/dashboard/categories",
          icon: FolderTree,
        },
        {
          label: "Orders",
          href: "/dashboard/orders",
          icon: ShoppingCart,
          badge: orderCount !== null && orderCount > 0 ? orderCount : undefined,
          badgeColor: orderCount && orderCount > 0 ? "bg-orange-500" : undefined,
        },
        { label: "Customers", href: "/dashboard/customers", icon: Users },
        { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
        { label: "Shipping", href: "/dashboard/shipping", icon: Truck },
        { label: "Themes", href: "/dashboard/themes", icon: Palette },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
        { label: "Help", href: "/dashboard/help", icon: HelpCircle },
      ],
    },
  ], [productCount, orderCount]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear auth
      setAuthToken(null);
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        border-r border-neutral-800 bg-neutral-950/90 backdrop-blur
        flex flex-col transition-all duration-300 ease-in-out
        relative
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Logo Header */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-neutral-900 flex-shrink-0">
            RX
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="text-sm font-semibold text-neutral-50 whitespace-nowrap">
                  Rodix Cloud
                </div>
                <div className="text-xs text-neutral-400 whitespace-nowrap">
                  E-commerce Dashboard
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
                >
                  {section.title}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                        : "text-neutral-300 hover:bg-neutral-900/80 border border-transparent hover:border-neutral-800"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-emerald-400" : "text-neutral-400 group-hover:text-neutral-200"}`}
                      strokeWidth={2}
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-[13px] flex-1 whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    {item.badge && !collapsed && (
                      <span
                        className={`
                          px-1.5 py-0.5 text-[10px] font-medium rounded-full
                          ${item.badgeColor || "bg-emerald-500/20 text-emerald-300"}
                        `}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800 p-3">
        {/* Plan Info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2 py-2 mb-2 text-[11px] text-neutral-400"
            >
              <div className="flex items-center justify-between">
                <span>Plan: Growth</span>
                <span className="text-emerald-400">14-day trial</span>
              </div>
              <div className="text-[10px] mt-1 text-neutral-500">
                After trial: $199/mo
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-neutral-400 hover:text-red-400 hover:bg-red-500/10
            border border-transparent hover:border-red-500/30
            transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[13px]"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
}
