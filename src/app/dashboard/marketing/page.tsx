"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection, DashboardGrid } from "@/components/dashboard";
import {
    Megaphone,
    Plus,
    Ticket,
    TrendingUp,
    Users,
    DollarSign,
    MoreHorizontal,
    Calendar,
    CheckCircle2,
    XCircle
} from "lucide-react";

// Mock Data for now
const DISCOUNTS = [
    {
        id: "1",
        code: "SUMMER2025",
        type: "percentage",
        value: 20,
        status: "active",
        usage: 142,
        sales: 4250,
        ends_at: "2025-08-31",
    },
    {
        id: "2",
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        status: "active",
        usage: 856,
        sales: 12400,
        ends_at: null,
    },
    {
        id: "3",
        code: "FREESHIP",
        type: "shipping",
        value: 0,
        status: "expired",
        usage: 45,
        sales: 890,
        ends_at: "2024-12-31",
    },
];

export default function MarketingPage() {
    const [discounts, setDiscounts] = useState(DISCOUNTS);

    return (
        <ProtectedRoute>
            <DashboardLayout title="Store" subtitle="Marketing">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Marketing & Discounts</h1>
                            <p className="text-sm text-neutral-400">Manage coupons and promotional campaigns</p>
                        </div>
                        <Link
                            href="/dashboard/marketing/new"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Discount
                        </Link>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-neutral-400">Active Discounts</span>
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Ticket className="h-4 w-4 text-emerald-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-neutral-100">
                                {discounts.filter(d => d.status === "active").length}
                            </div>
                        </div>

                        <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-neutral-400">Total Redemptions</span>
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Users className="h-4 w-4 text-blue-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-neutral-100">
                                {discounts.reduce((acc, curr) => acc + curr.usage, 0).toLocaleString()}
                            </div>
                        </div>

                        <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-neutral-400">Sales Generated</span>
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-amber-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-neutral-100">
                                ${discounts.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Discounts List */}
                    <DashboardSection title="Discounts" subtitle="Active and expired codes">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Code</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Type</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Used</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Sales</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount) => (
                                        <tr key={discount.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-mono font-medium text-emerald-400">{discount.code}</div>
                                                <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {discount.ends_at ? `Ends ${discount.ends_at}` : "No expiry"}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${discount.status === "active"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                                                    }`}>
                                                    {discount.status === "active" ? (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3" />
                                                    )}
                                                    {discount.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-neutral-300 capitalize">
                                                    {discount.type === "percentage" ? `${discount.value}% Off` :
                                                        discount.type === "fixed" ? `$${discount.value} Off` :
                                                            "Free Shipping"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-neutral-300">
                                                {discount.usage}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-neutral-300">
                                                ${discount.sales.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
