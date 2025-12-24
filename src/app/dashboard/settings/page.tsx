"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    Settings, Store, Globe, CreditCard, Bell, Shield, Palette,
    Save, Loader2, Check, AlertTriangle, Mail, Phone, MapPin,
    DollarSign, Percent, Image as ImageIcon, ShoppingCart, Users
} from "lucide-react";

interface StoreSettings {
    store_name: string;
    store_email: string;
    store_phone: string;
    store_address: string;
    store_currency: string;
    store_language: string;
    store_timezone: string;
    tax_rate: number;
    logo_url: string;
    free_shipping_min: number;
    // Checkout settings
    enable_guest_checkout: boolean;
    require_phone: boolean;
    require_address: boolean;
}

const CURRENCIES = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "KWD", label: "Kuwaiti Dinar (KD)" },
    { value: "SAR", label: "Saudi Riyal (SAR)" },
    { value: "AED", label: "UAE Dirham (AED)" },
    { value: "MAD", label: "Moroccan Dirham (MAD)" },
];

const TIMEZONES = [
    { value: "UTC", label: "UTC" },
    { value: "Asia/Kuwait", label: "Kuwait (GMT+3)" },
    { value: "Asia/Riyadh", label: "Saudi Arabia (GMT+3)" },
    { value: "Asia/Dubai", label: "UAE (GMT+4)" },
    { value: "Africa/Casablanca", label: "Morocco (GMT+1)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "America/New_York", label: "New York (GMT-5)" },
];

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("general");

    const [settings, setSettings] = useState<StoreSettings>({
        store_name: "Rodix Store",
        store_email: "",
        store_phone: "",
        store_address: "",
        store_currency: "USD",
        store_language: "en",
        store_timezone: "UTC",
        tax_rate: 0,
        logo_url: "",
        free_shipping_min: 200,
        // Checkout defaults
        enable_guest_checkout: true,
        require_phone: false,
        require_address: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await http.get("/settings");
                if (response.data?.data) {
                    // Merge API data with defaults
                    setSettings(prev => ({ ...prev, ...response.data.data }));
                } else if (response.data) {
                    setSettings(prev => ({ ...prev, ...response.data }));
                }
            } catch {
                // API not available, use localStorage
                const saved = localStorage.getItem("store_settings");
                if (saved) {
                    setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSuccess("");
        setError("");

        try {
            await http.put("/settings", settings);
            setSuccess("Settings saved successfully!");
        } catch (err) {
            // Save to localStorage as fallback
            localStorage.setItem("store_settings", JSON.stringify(settings));
            setSuccess("Settings saved locally! (Backend not available)");
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const updateSetting = (key: keyof StoreSettings, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: "general", label: "General", icon: Store },
        { id: "checkout", label: "Checkout", icon: ShoppingCart },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="System" subtitle="Settings">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="System" subtitle="Settings">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Settings</h1>
                            <p className="text-sm text-neutral-400">Configure your store preferences</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </button>
                    </div>

                    {/* Messages */}
                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                            <Check className="h-4 w-4" />
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* General Tab */}
                    {activeTab === "general" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DashboardSection>
                                <h3 className="text-lg font-semibold text-neutral-100 mb-6 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-emerald-400" />
                                    Store Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.store_name}
                                            onChange={(e) => updateSetting("store_name", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="My Store"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Store Email
                                            </div>
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.store_email}
                                            onChange={(e) => updateSetting("store_email", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="contact@mystore.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </div>
                                        </label>
                                        <input
                                            type="tel"
                                            value={settings.store_phone}
                                            onChange={(e) => updateSetting("store_phone", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Store Address
                                            </div>
                                        </label>
                                        <textarea
                                            value={settings.store_address}
                                            onChange={(e) => updateSetting("store_address", e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                            placeholder="123 Main Street, City, Country"
                                        />
                                    </div>
                                </div>
                            </DashboardSection>

                            <DashboardSection>
                                <h3 className="text-lg font-semibold text-neutral-100 mb-6 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-emerald-400" />
                                    Regional Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Currency
                                            </div>
                                        </label>
                                        <select
                                            value={settings.store_currency}
                                            onChange={(e) => updateSetting("store_currency", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={settings.store_timezone}
                                            onChange={(e) => updateSetting("store_timezone", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        >
                                            {TIMEZONES.map((tz) => (
                                                <option key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4" />
                                                Tax Rate (%)
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={settings.tax_rate}
                                            onChange={(e) => updateSetting("tax_rate", parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="0.0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4" />
                                                Logo URL
                                            </div>
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.logo_url}
                                            onChange={(e) => updateSetting("logo_url", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            placeholder="https://example.com/logo.png"
                                        />
                                        {settings.logo_url && (
                                            <div className="mt-3">
                                                <img
                                                    src={settings.logo_url}
                                                    alt="Store logo"
                                                    className="h-16 object-contain rounded-lg border border-neutral-700"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DashboardSection>
                        </div>
                    )}

                    {/* Checkout Tab */}
                    {activeTab === "checkout" && (
                        <DashboardSection>
                            <h3 className="text-lg font-semibold text-neutral-100 mb-6 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-emerald-400" />
                                Checkout Settings
                            </h3>
                            <div className="space-y-6">
                                {/* Guest Checkout Toggle */}
                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-100">Guest Checkout</h4>
                                            <p className="text-xs text-neutral-500">
                                                السماح للعملاء بالشراء بدون إنشاء حساب
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, enable_guest_checkout: !prev.enable_guest_checkout }))}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.enable_guest_checkout
                                            ? 'bg-emerald-500'
                                            : 'bg-neutral-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.enable_guest_checkout ? 'left-7' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Require Phone Toggle */}
                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Phone className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-100">Require Phone Number</h4>
                                            <p className="text-xs text-neutral-500">
                                                إلزام العميل بإدخال رقم الهاتف
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, require_phone: !prev.require_phone }))}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.require_phone
                                            ? 'bg-emerald-500'
                                            : 'bg-neutral-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.require_phone ? 'left-7' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Require Address Toggle */}
                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-100">Require Shipping Address</h4>
                                            <p className="text-xs text-neutral-500">
                                                إلزام العميل بإدخال عنوان الشحن
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, require_address: !prev.require_address }))}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.require_address
                                            ? 'bg-emerald-500'
                                            : 'bg-neutral-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${settings.require_address ? 'left-7' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>

                            </div>
                        </DashboardSection>
                    )}

                    {/* Payments Tab */}
                    {activeTab === "payments" && (
                        <DashboardSection>
                            <div className="flex flex-col items-center justify-center py-12">
                                <CreditCard className="h-12 w-12 text-neutral-700 mb-4" />
                                <h3 className="text-lg font-medium text-neutral-300 mb-2">Payment Settings</h3>
                                <p className="text-neutral-500 text-center max-w-md">
                                    Configure payment gateways, accepted methods, and transaction settings.
                                    This feature will be available once the payments API is implemented.
                                </p>
                            </div>
                        </DashboardSection>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <DashboardSection>
                            <div className="flex flex-col items-center justify-center py-12">
                                <Bell className="h-12 w-12 text-neutral-700 mb-4" />
                                <h3 className="text-lg font-medium text-neutral-300 mb-2">Notification Settings</h3>
                                <p className="text-neutral-500 text-center max-w-md">
                                    Configure email notifications, alerts, and communication preferences.
                                    This feature will be available once the notifications API is implemented.
                                </p>
                            </div>
                        </DashboardSection>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <DashboardSection>
                            <div className="flex flex-col items-center justify-center py-12">
                                <Shield className="h-12 w-12 text-neutral-700 mb-4" />
                                <h3 className="text-lg font-medium text-neutral-300 mb-2">Security Settings</h3>
                                <p className="text-neutral-500 text-center max-w-md">
                                    Configure security settings, two-factor authentication, and access controls.
                                    This feature will be available once the security API is implemented.
                                </p>
                            </div>
                        </DashboardSection>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
