"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection, DashboardGrid } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye,
    BarChart3, PieChart, MapPin, RefreshCw, Calendar, ArrowUpRight,
    Package, ShoppingBag, Clock, Loader2
} from "lucide-react";

interface KPI {
    revenue: number;
    orders: number;
    aov: number;
    mrr: number;
}

interface SalesTimelineItem {
    label: string;
    value: number;
}

interface ConversionFunnel {
    visits: number;
    productViews: number;
    addToCart: number;
    orders: number;
}

interface VisitorFlow {
    browsing: number;
    inCart: number;
    checkout: number;
}

interface TopLocation {
    country: string;
    city: string;
    sessions: number;
    share: number;
}

interface AnalyticsData {
    range: string;
    kpis: KPI;
    salesTimeline: SalesTimelineItem[];
    conversionFunnel: ConversionFunnel;
    visitorFlow: VisitorFlow;
    topLocations: TopLocation[];
}

const RANGES = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "12m", label: "Last 12 Months" },
];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [range, setRange] = useState("30d");

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await http.get(`/analytics?range=${range}`);
            setData(response.data);
        } catch (err: any) {
            console.error("Failed to fetch analytics:", err);
            setError("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    // Calculate conversion rates
    const getConversionRate = (from: number, to: number) => {
        if (from === 0) return 0;
        return ((to / from) * 100).toFixed(1);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Dashboard" subtitle="Analytics">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Analytics</h1>
                                <p className="text-sm text-neutral-400">Track your store performance</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <BarChart3 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">Live Data</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Range Selector */}
                            <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
                                {RANGES.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setRange(r.value)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${range === r.value
                                                ? "bg-emerald-500 text-white"
                                                : "text-neutral-400 hover:text-neutral-200"
                                            }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => fetchAnalytics()}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    ) : data ? (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Revenue */}
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-neutral-400">Total Revenue</span>
                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                            <DollarSign className="h-4 w-4 text-emerald-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-neutral-100">
                                        {formatCurrency(data.kpis.revenue)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>vs previous period</span>
                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-neutral-400">Total Orders</span>
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <ShoppingCart className="h-4 w-4 text-blue-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-neutral-100">
                                        {formatNumber(data.kpis.orders)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
                                        <Package className="h-4 w-4" />
                                        <span>Completed orders</span>
                                    </div>
                                </div>

                                {/* Average Order Value */}
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-neutral-400">Avg. Order Value</span>
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <ShoppingBag className="h-4 w-4 text-purple-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-neutral-100">
                                        {formatCurrency(data.kpis.aov)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-purple-400 text-sm">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span>Per transaction</span>
                                    </div>
                                </div>

                                {/* MRR */}
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-neutral-400">Monthly Revenue</span>
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <TrendingUp className="h-4 w-4 text-amber-400" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-neutral-100">
                                        {formatCurrency(data.kpis.mrr)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-amber-400 text-sm">
                                        <Clock className="h-4 w-4" />
                                        <span>Recurring estimate</span>
                                    </div>
                                </div>
                            </div>

                            <DashboardGrid columns={3} gap="md">
                                {/* Sales Timeline Chart */}
                                <DashboardSection title="Sales Timeline" subtitle={`Revenue over ${range}`} className="lg:col-span-2">
                                    <div className="h-64">
                                        {data.salesTimeline.length > 0 ? (
                                            <div className="h-full flex items-end gap-1">
                                                {data.salesTimeline.map((item, index) => {
                                                    const maxValue = Math.max(...data.salesTimeline.map(i => i.value));
                                                    const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                                    return (
                                                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                                            <div
                                                                style={{ height: `${Math.max(height, 2)}%` }}
                                                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm hover:from-emerald-500 hover:to-emerald-300 transition-colors cursor-pointer"
                                                                title={`${item.label}: ${formatCurrency(item.value)}`}
                                                            />
                                                            <span className="text-[10px] text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                                                {item.label.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-neutral-500">
                                                No sales data for this period
                                            </div>
                                        )}
                                    </div>
                                </DashboardSection>

                                {/* Conversion Funnel */}
                                <DashboardSection title="Conversion Funnel" subtitle="Visitor journey">
                                    <div className="space-y-4">
                                        {[
                                            { label: "Visits", value: data.conversionFunnel.visits, color: "bg-blue-500" },
                                            { label: "Product Views", value: data.conversionFunnel.productViews, color: "bg-purple-500" },
                                            { label: "Add to Cart", value: data.conversionFunnel.addToCart, color: "bg-amber-500" },
                                            { label: "Orders", value: data.conversionFunnel.orders, color: "bg-emerald-500" },
                                        ].map((step, index, arr) => {
                                            const maxValue = arr[0].value || 1;
                                            const width = (step.value / maxValue) * 100;
                                            const nextStep = arr[index + 1];
                                            const convRate = nextStep ? getConversionRate(step.value, nextStep.value) : null;

                                            return (
                                                <div key={step.label}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-neutral-300">{step.label}</span>
                                                        <span className="text-sm font-medium text-neutral-100">
                                                            {formatNumber(step.value)}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${step.color} rounded-full transition-all duration-500`}
                                                            style={{ width: `${width}%` }}
                                                        />
                                                    </div>
                                                    {convRate && (
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            → {convRate}% conversion
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </DashboardSection>
                            </DashboardGrid>

                            <DashboardGrid columns={2} gap="md">
                                {/* Visitor Flow */}
                                <DashboardSection title="Visitor Status" subtitle="Current visitor breakdown">
                                    <div className="space-y-4">
                                        {[
                                            { label: "Browsing", value: data.visitorFlow.browsing, color: "text-blue-400", bg: "bg-blue-500/10", icon: Eye },
                                            { label: "In Cart", value: data.visitorFlow.inCart, color: "text-amber-400", bg: "bg-amber-500/10", icon: ShoppingCart },
                                            { label: "Checkout", value: data.visitorFlow.checkout, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Package },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            const total = data.visitorFlow.browsing + data.visitorFlow.inCart + data.visitorFlow.checkout;
                                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

                                            return (
                                                <div key={item.label} className={`flex items-center justify-between p-4 ${item.bg} rounded-xl`}>
                                                    <div className="flex items-center gap-3">
                                                        <Icon className={`h-5 w-5 ${item.color}`} />
                                                        <span className="text-neutral-200">{item.label}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-lg font-semibold ${item.color}`}>
                                                            {formatNumber(item.value)}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">{percentage}%</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </DashboardSection>

                                {/* Top Locations */}
                                <DashboardSection title="Top Locations" subtitle="Orders by region">
                                    <div className="space-y-3">
                                        {data.topLocations.length > 0 ? (
                                            data.topLocations.slice(0, 5).map((location, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-xs text-neutral-400">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-neutral-200">{location.city}</p>
                                                            <p className="text-xs text-neutral-500">{location.country}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-neutral-200">
                                                            {formatNumber(location.sessions)} orders
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {(location.share * 100).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                                                <MapPin className="h-8 w-8 mb-2" />
                                                <p>No location data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </DashboardSection>
                            </DashboardGrid>
                        </>
                    ) : null}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
