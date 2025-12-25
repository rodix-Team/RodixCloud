"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import {
    Palette, Check, Eye, Smartphone, Monitor, Moon, Sun,
    Layout, Grid, List, AlertTriangle, ExternalLink
} from "lucide-react";

interface Theme {
    id: string;
    name: string;
    preview: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    active: boolean;
}

const THEMES: Theme[] = [
    {
        id: "emerald-dark",
        name: "Emerald Dark",
        preview: "Current theme",
        colors: { primary: "#10b981", secondary: "#1f2937", accent: "#059669" },
        active: true,
    },
    {
        id: "ocean-blue",
        name: "Ocean Blue",
        preview: "Professional look",
        colors: { primary: "#3b82f6", secondary: "#1e3a5f", accent: "#2563eb" },
        active: false,
    },
    {
        id: "sunset-orange",
        name: "Sunset Orange",
        preview: "Warm & inviting",
        colors: { primary: "#f97316", secondary: "#431407", accent: "#ea580c" },
        active: false,
    },
    {
        id: "royal-purple",
        name: "Royal Purple",
        preview: "Elegant & modern",
        colors: { primary: "#a855f7", secondary: "#2e1065", accent: "#9333ea" },
        active: false,
    },
];

export default function ThemesPage() {
    const [themes, setThemes] = useState(THEMES);
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

    const activateTheme = (id: string) => {
        setThemes(prev =>
            prev.map(t => ({ ...t, active: t.id === id }))
        );
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Management" subtitle="Themes">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Themes</h1>
                            <p className="text-sm text-neutral-400">Customize your store's appearance</p>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
                            <button
                                onClick={() => setPreviewMode("desktop")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === "desktop"
                                        ? "bg-emerald-500 text-white"
                                        : "text-neutral-400 hover:text-neutral-200"
                                    }`}
                            >
                                <Monitor className="h-4 w-4" />
                                Desktop
                            </button>
                            <button
                                onClick={() => setPreviewMode("mobile")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === "mobile"
                                        ? "bg-emerald-500 text-white"
                                        : "text-neutral-400 hover:text-neutral-200"
                                    }`}
                            >
                                <Smartphone className="h-4 w-4" />
                                Mobile
                            </button>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                        <div>
                            <p className="text-amber-400 font-medium">Coming Soon</p>
                            <p className="text-amber-400/80 text-sm">Theme customization is a preview feature. Full theming support will be available in a future update.</p>
                        </div>
                    </div>

                    {/* Theme Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {themes.map((theme) => (
                            <div
                                key={theme.id}
                                className={`relative rounded-xl border transition-all cursor-pointer ${theme.active
                                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                        : "border-neutral-800 hover:border-neutral-700"
                                    }`}
                                onClick={() => activateTheme(theme.id)}
                            >
                                {/* Theme Preview */}
                                <div
                                    className="h-32 rounded-t-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.primary}40 100%)`,
                                    }}
                                >
                                    <div className="flex items-center justify-center h-full gap-2">
                                        <div
                                            className="w-8 h-8 rounded-lg"
                                            style={{ backgroundColor: theme.colors.primary }}
                                        />
                                        <div
                                            className="w-8 h-8 rounded-lg"
                                            style={{ backgroundColor: theme.colors.secondary }}
                                        />
                                        <div
                                            className="w-8 h-8 rounded-lg"
                                            style={{ backgroundColor: theme.colors.accent }}
                                        />
                                    </div>
                                </div>

                                {/* Theme Info */}
                                <div className="p-4 bg-neutral-900 rounded-b-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-neutral-200">{theme.name}</h4>
                                            <p className="text-xs text-neutral-500">{theme.preview}</p>
                                        </div>
                                        {theme.active && (
                                            <div className="p-1.5 bg-emerald-500 rounded-full">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Current Theme Settings */}
                    <DashboardSection>
                        <h3 className="text-lg font-semibold text-neutral-100 mb-6 flex items-center gap-2">
                            <Palette className="h-5 w-5 text-emerald-400" />
                            Current Theme Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-neutral-800/50 rounded-xl">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Dark Mode
                                </label>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg">
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg">
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-neutral-800/50 rounded-xl">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Layout
                                </label>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg">
                                        <Layout className="h-4 w-4" />
                                        Wide
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg">
                                        <Grid className="h-4 w-4" />
                                        Compact
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-neutral-800/50 rounded-xl">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Sidebar Style
                                </label>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg">
                                        <List className="h-4 w-4" />
                                        Full
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg">
                                        <Grid className="h-4 w-4" />
                                        Icons
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DashboardSection>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
