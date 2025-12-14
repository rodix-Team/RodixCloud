"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import {
    CreditCard, Plus, Edit2, Trash2, Check, ExternalLink,
    Loader2, DollarSign, CheckCircle, XCircle,
    Wallet, Banknote, Building
} from "lucide-react";

interface PaymentMethod {
    id: string;
    name: string;
    type: "card" | "bank" | "wallet" | "cod";
    enabled: boolean;
    icon: typeof CreditCard;
    description: string;
    fee: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: "stripe",
        name: "Stripe",
        type: "card",
        enabled: true,
        icon: CreditCard,
        description: "Accept credit and debit cards",
        fee: "2.9% + $0.30",
    },
    {
        id: "paypal",
        name: "PayPal",
        type: "wallet",
        enabled: false,
        icon: Wallet,
        description: "Accept PayPal payments",
        fee: "3.49% + $0.49",
    },
    {
        id: "bank",
        name: "Bank Transfer",
        type: "bank",
        enabled: true,
        icon: Building,
        description: "Direct bank transfers",
        fee: "No fee",
    },
    {
        id: "cod",
        name: "Cash on Delivery",
        type: "cod",
        enabled: true,
        icon: Banknote,
        description: "Pay when receiving the order",
        fee: "No fee",
    },
];

export default function PaymentsPage() {
    const [methods, setMethods] = useState(PAYMENT_METHODS);
    const [saving, setSaving] = useState<string | null>(null);

    const toggleMethod = async (id: string) => {
        setSaving(id);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setMethods(prev =>
            prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
        );
        setSaving(null);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "card": return "text-blue-400 bg-blue-500/10";
            case "wallet": return "text-purple-400 bg-purple-500/10";
            case "bank": return "text-amber-400 bg-amber-500/10";
            case "cod": return "text-emerald-400 bg-emerald-500/10";
            default: return "text-neutral-400 bg-neutral-500/10";
        }
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Management" subtitle="Payments">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Payments</h1>
                            <p className="text-sm text-neutral-400">Manage payment methods and gateways</p>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <CreditCard className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-blue-400 font-medium">Payment Gateway Configuration</p>
                            <p className="text-blue-400/80 text-sm">Toggle payment methods on/off. Gateway credentials can be configured in Settings.</p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <DashboardSection>
                        <h3 className="text-lg font-semibold text-neutral-100 mb-6 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-emerald-400" />
                            Payment Methods
                        </h3>
                        <div className="space-y-4">
                            {methods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <div
                                        key={method.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${method.enabled
                                            ? "bg-neutral-800/50 border-neutral-700"
                                            : "bg-neutral-900/30 border-neutral-800 opacity-60"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${getTypeColor(method.type)}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-neutral-200">{method.name}</h4>
                                                    {method.enabled && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-neutral-500">{method.description}</p>
                                                <p className="text-xs text-neutral-600 mt-1">Fee: {method.fee}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 rounded-lg transition-colors"
                                                title="Configure"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleMethod(method.id)}
                                                disabled={saving === method.id}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${method.enabled ? "bg-emerald-500" : "bg-neutral-700"
                                                    }`}
                                            >
                                                {saving === method.id ? (
                                                    <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-white" />
                                                ) : (
                                                    <span
                                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${method.enabled ? "translate-x-7" : "translate-x-1"
                                                            }`}
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardSection>

                    {/* Transaction Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-neutral-400">Today's Revenue</span>
                                <DollarSign className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-neutral-100">$0.00</p>
                            <p className="text-xs text-neutral-500 mt-1">No transactions today</p>
                        </div>
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-neutral-400">Successful</span>
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-neutral-100">0</p>
                            <p className="text-xs text-neutral-500 mt-1">Completed payments</p>
                        </div>
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-neutral-400">Failed</span>
                                <XCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold text-neutral-100">0</p>
                            <p className="text-xs text-neutral-500 mt-1">Failed transactions</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
