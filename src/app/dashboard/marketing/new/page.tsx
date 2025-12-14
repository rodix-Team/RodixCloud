"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import {
    ArrowLeft,
    Save,
    Ticket,
    Percent,
    DollarSign,
    Truck,
    Calendar,
    Sparkles,
    RefreshCw
} from "lucide-react";

export default function NewDiscountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [code, setCode] = useState("");
    const [type, setType] = useState<"percentage" | "fixed" | "shipping">("percentage");
    const [value, setValue] = useState("");
    const [minPurchase, setMinPurchase] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState<"active" | "draft">("active");

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect back to marketing list
        router.push("/dashboard/marketing");
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Marketing" subtitle="New Discount">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/marketing"
                                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Create Discount</h1>
                                <p className="text-sm text-neutral-400">Add a new coupon code</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus(status === "active" ? "draft" : "active")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${status === "active"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                    }`}
                            >
                                {status === "active" ? "Active" : "Draft"}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Discount Code */}
                        <DashboardSection title="Discount Code" subtitle="The code customers will enter at checkout">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Ticket className="h-5 w-5 text-neutral-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. SUMMER2025"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-lg font-mono tracking-wider text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={generateCode}
                                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Generate
                                </button>
                            </div>
                        </DashboardSection>

                        {/* Discount Type */}
                        <DashboardSection title="Discount Type" subtitle="How should this discount be applied?">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType("percentage")}
                                    className={`p-4 rounded-xl border text-left transition-all ${type === "percentage"
                                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50"
                                            : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg w-fit mb-3 ${type === "percentage" ? "bg-emerald-500 text-white" : "bg-neutral-700 text-neutral-400"
                                        }`}>
                                        <Percent className="h-5 w-5" />
                                    </div>
                                    <h3 className={`font-medium mb-1 ${type === "percentage" ? "text-emerald-400" : "text-neutral-200"}`}>Percentage</h3>
                                    <p className="text-xs text-neutral-500">Discount a percentage of the total order value</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType("fixed")}
                                    className={`p-4 rounded-xl border text-left transition-all ${type === "fixed"
                                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50"
                                            : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg w-fit mb-3 ${type === "fixed" ? "bg-emerald-500 text-white" : "bg-neutral-700 text-neutral-400"
                                        }`}>
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <h3 className={`font-medium mb-1 ${type === "fixed" ? "text-emerald-400" : "text-neutral-200"}`}>Fixed Amount</h3>
                                    <p className="text-xs text-neutral-500">Discount a specific amount from the order</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setType("shipping")}
                                    className={`p-4 rounded-xl border text-left transition-all ${type === "shipping"
                                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50"
                                            : "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg w-fit mb-3 ${type === "shipping" ? "bg-emerald-500 text-white" : "bg-neutral-700 text-neutral-400"
                                        }`}>
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <h3 className={`font-medium mb-1 ${type === "shipping" ? "text-emerald-400" : "text-neutral-200"}`}>Free Shipping</h3>
                                    <p className="text-xs text-neutral-500">Remove shipping costs from the order</p>
                                </button>
                            </div>

                            {type !== "shipping" && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Discount Value
                                    </label>
                                    <div className="relative max-w-xs">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {type === "percentage" ? (
                                                <Percent className="h-4 w-4 text-neutral-500" />
                                            ) : (
                                                <DollarSign className="h-4 w-4 text-neutral-500" />
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder={type === "percentage" ? "10" : "5.00"}
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </DashboardSection>

                        {/* Requirements & Limits */}
                        <DashboardSection title="Requirements & Limits" subtitle="Set conditions for this discount">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Minimum Purchase Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={minPurchase}
                                        onChange={(e) => setMinPurchase(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Usage Limit (Total uses)
                                    </label>
                                    <input
                                        type="number"
                                        value={usageLimit}
                                        onChange={(e) => setUsageLimit(e.target.value)}
                                        placeholder="Unlimited"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </DashboardSection>

                        {/* Active Dates */}
                        <DashboardSection title="Active Dates" subtitle="When should this discount be valid?">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Start Date
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-neutral-500" />
                                        </div>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        End Date (Optional)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-neutral-500" />
                                        </div>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </DashboardSection>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-800">
                            <Link
                                href="/dashboard/marketing"
                                className="px-6 py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                {loading ? "Creating..." : "Create Discount"}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
