"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/store/app-store";
import { useNotificationStore, useUnreadCount } from "@/store/notification-store";

type HeaderProps = {
  title?: string;
  subtitle?: string;
};

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Overview",
}: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Real notifications from store
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = useUnreadCount();

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${Math.floor(diffHours / 24)} يوم`;
  };

  return (
    <header className="h-16 border-b border-neutral-800 px-6 flex items-center justify-between bg-neutral-950/90 backdrop-blur sticky top-0 z-40">
      {/* Left: Title */}
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          {title}
        </span>
        <span className="text-lg font-semibold text-neutral-50">{subtitle}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-2"
              >
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  autoFocus
                />
                <div className="mt-2 px-2 py-1.5 text-xs text-neutral-500">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">
                    ⌘K
                  </kbd>{" "}
                  to search anywhere
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language */}
        <button className="px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          EN
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-200">
                    الإشعارات {unreadCount > 0 && `(${unreadCount})`}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      قراءة الكل
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-neutral-800/50 hover:bg-neutral-800/50 cursor-pointer ${!notif.read ? "bg-emerald-500/5" : ""
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notif.read && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          )}
                          <div className={!notif.read ? "" : "ml-5"}>
                            <p className="text-sm text-neutral-200">
                              {notif.title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-neutral-600 mt-1">
                              {formatTimeAgo(notif.time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 bg-neutral-800/50">
                  <button className="w-full text-xs text-neutral-400 hover:text-neutral-200">
                    عرض كل الإشعارات
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[11px] font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs text-neutral-200">
                {user?.name || "Admin"}
              </div>
              <div className="text-[10px] text-neutral-500">
                {user?.email || "admin@example.com"}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-neutral-800">
                  <p className="text-sm font-medium text-neutral-200">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
                <div className="py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3">
                    <User className="h-4 w-4 text-neutral-500" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-3">
                    <Settings className="h-4 w-4 text-neutral-500" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-neutral-800 py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showSearch || showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowSearch(false);
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
