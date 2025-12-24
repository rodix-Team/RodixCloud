"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection, DashboardGrid } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye,
    BarChart3, PieChart, MapPin, RefreshCw, Calendar, ArrowUpRight,
    Package, ShoppingBag, Clock, Loader2, AlertTriangle, Lightbulb,
    Star, Target, Zap, Award, TrendingDown as TrendDown, Box
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Types
interface KPI {
    revenue: number;
    orders: number;
    aov: number;
    mrr: number;
    profit?: number;
    customers?: number;
}

interface SalesTimelineItem {
    label: string;
    value: number;
    orders?: number;
}

interface TopProduct {
    id: number;
    name: string;
    sales: number;
    revenue: number;
    image?: string;
}

interface TopCustomer {
    id: number;
    name: string;
    email: string;
    orders: number;
    total_spent: number;
    segment?: string;
}

interface StockAlert {
    id: number;
    name: string;
    stock: number;
    avg_daily_sales: number;
    days_until_empty: number;
}

interface AnalyticsData {
    range: string;
    kpis: KPI;
    salesTimeline: SalesTimelineItem[];
    topProducts: TopProduct[];
    topCustomers: TopCustomer[];
    stockAlerts: StockAlert[];
    ordersByStatus?: { status: string; count: number }[];
    revenueByCategory?: { category: string; revenue: number }[];
}

const RANGES = [
    { value: "7d", label: "7 أيام" },
    { value: "30d", label: "30 يوم" },
    { value: "90d", label: "90 يوم" },
    { value: "12m", label: "سنة" },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CUSTOMER_SEGMENTS = {
    'vip': { label: 'VIP', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'regular': { label: 'منتظم', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'new': { label: 'جديد', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'at_risk': { label: 'معرض للمغادرة', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [range, setRange] = useState("30d");
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'insights'>('overview');

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // Fetch from multiple endpoints
            const [overviewRes, ordersRes, productsRes, customersRes] = await Promise.all([
                http.get(`/dashboard/stats`).catch(() => null),
                http.get(`/orders`).catch(() => null),
                http.get(`/products`).catch(() => null),
                http.get(`/customers`).catch(() => null),
            ]);

            // Process the data
            const orders = ordersRes?.data?.data || ordersRes?.data || [];
            const products = productsRes?.data?.data || productsRes?.data || [];
            const customers = customersRes?.data?.data || customersRes?.data || [];
            const stats = overviewRes?.data || {};

            // Calculate KPIs
            const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Calculate sales timeline (last 7 days)
            const salesByDay: { [key: string]: { value: number; orders: number } } = {};
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                salesByDay[key] = { value: 0, orders: 0 };
            }
            orders.forEach((order: any) => {
                const date = order.created_at?.split('T')[0];
                if (salesByDay[date]) {
                    salesByDay[date].value += parseFloat(order.total) || 0;
                    salesByDay[date].orders += 1;
                }
            });
            const salesTimeline = Object.entries(salesByDay).map(([date, data]) => ({
                label: new Date(date).toLocaleDateString('ar-AE', { weekday: 'short', day: 'numeric' }),
                ...data
            }));

            // Top products
            const productSales: { [key: number]: TopProduct } = {};
            orders.forEach((order: any) => {
                (order.items || []).forEach((item: any) => {
                    const productId = item.product_id;
                    const product = products.find((p: any) => p.id === productId);
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            id: productId,
                            name: product?.name || item.product_name || 'منتج',
                            sales: 0,
                            revenue: 0,
                            image: product?.image_url
                        };
                    }
                    productSales[productId].sales += item.quantity || 1;
                    productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
                });
            });
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Top customers
            const customerStats: { [key: number]: TopCustomer } = {};
            orders.forEach((order: any) => {
                const customerId = order.user_id || order.customer_id;
                if (!customerId) return;
                const customer = customers.find((c: any) => c.id === customerId);
                if (!customerStats[customerId]) {
                    customerStats[customerId] = {
                        id: customerId,
                        name: customer?.name || order.shipping_name || 'عميل',
                        email: customer?.email || order.email || '',
                        orders: 0,
                        total_spent: 0,
                        segment: 'new'
                    };
                }
                customerStats[customerId].orders += 1;
                customerStats[customerId].total_spent += parseFloat(order.total) || 0;
            });
            // Assign segments
            Object.values(customerStats).forEach(c => {
                if (c.total_spent >= 1000) c.segment = 'vip';
                else if (c.orders >= 3) c.segment = 'regular';
                else c.segment = 'new';
            });
            const topCustomers = Object.values(customerStats)
                .sort((a, b) => b.total_spent - a.total_spent)
                .slice(0, 5);

            // Stock alerts
            const stockAlerts: StockAlert[] = products
                .filter((p: any) => (p.stock || 0) < 10 && (p.stock || 0) > 0)
                .map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    stock: p.stock || 0,
                    avg_daily_sales: 1,
                    days_until_empty: p.stock || 0
                }))
                .slice(0, 5);

            // Orders by status
            const statusCounts: { [key: string]: number } = {};
            orders.forEach((o: any) => {
                const status = o.status || 'pending';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
                status: status === 'pending' ? 'قيد الانتظار' :
                        status === 'processing' ? 'قيد المعالجة' :
                        status === 'shipped' ? 'تم الشحن' :
                        status === 'delivered' ? 'تم التسليم' :
                        status === 'cancelled' ? 'ملغي' : status,
                count
            }));

            setData({
                range,
                kpis: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    aov: avgOrderValue,
                    mrr: totalRevenue / (range === '12m' ? 12 : range === '90d' ? 3 : 1),
                    profit: totalRevenue * 0.25, // Estimated 25% profit margin
                    customers: customers.length
                },
                salesTimeline,
                topProducts,
                topCustomers,
                stockAlerts,
                ordersByStatus
            });
        } catch (err: any) {
            console.error("Failed to fetch analytics:", err);
            setError("فشل في تحميل البيانات");
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ar-AE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + ' درهم';
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('ar-AE').format(value);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Dashboard" subtitle="Analytics">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">📊 التحليلات المتقدمة</h1>
                                <p className="text-sm text-neutral-400">تتبع أداء متجرك بذكاء</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-emerald-400">مباشر</span>
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
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-neutral-800 pb-2">
                        {[
                            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
                            { id: 'products', label: 'المنتجات', icon: Package },
                            { id: 'customers', label: 'العملاء', icon: Users },
                            { id: 'insights', label: 'رؤى ذكية', icon: Lightbulb },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
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
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <>
                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        {[
                                            { label: 'الإيرادات', value: data.kpis.revenue, format: 'currency', icon: DollarSign, color: 'emerald' },
                                            { label: 'الأرباح', value: data.kpis.profit || 0, format: 'currency', icon: TrendingUp, color: 'green' },
                                            { label: 'الطلبات', value: data.kpis.orders, format: 'number', icon: ShoppingCart, color: 'blue' },
                                            { label: 'متوسط الطلب', value: data.kpis.aov, format: 'currency', icon: ShoppingBag, color: 'purple' },
                                            { label: 'العملاء', value: data.kpis.customers || 0, format: 'number', icon: Users, color: 'amber' },
                                            { label: 'الإيراد الشهري', value: data.kpis.mrr, format: 'currency', icon: Target, color: 'pink' },
                                        ].map((kpi, index) => {
                                            const Icon = kpi.icon;
                                            return (
                                                <div key={index} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-neutral-400">{kpi.label}</span>
                                                        <div className={`p-1.5 bg-${kpi.color}-500/10 rounded-lg`}>
                                                            <Icon className={`h-3.5 w-3.5 text-${kpi.color}-400`} />
                                                        </div>
                                                    </div>
                                                    <p className="text-xl font-bold text-neutral-100">
                                                        {kpi.format === 'currency' ? formatCurrency(kpi.value) : formatNumber(kpi.value)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Sales Chart */}
                                        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                            <h3 className="text-lg font-semibold text-neutral-100 mb-4">📈 المبيعات اليومية</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={data.salesTimeline}>
                                                        <defs>
                                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                        <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                                            labelStyle={{ color: '#fff' }}
                                                            formatter={(value: any) => [formatCurrency(value), 'الإيرادات']}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#10b981"
                                                            strokeWidth={2}
                                                            fillOpacity={1}
                                                            fill="url(#colorRevenue)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Orders by Status */}
                                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                            <h3 className="text-lg font-semibold text-neutral-100 mb-4">📊 حالة الطلبات</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RePieChart>
                                                        <Pie
                                                            data={data.ordersByStatus}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                            label={({ status, count }) => `${status}: ${count}`}
                                                            labelLine={false}
                                                        >
                                                            {data.ordersByStatus?.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </RePieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock Alerts */}
                                    {data.stockAlerts.length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                <h3 className="text-lg font-semibold text-amber-400">⚠️ تنبيهات المخزون</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {data.stockAlerts.map((alert) => (
                                                    <div key={alert.id} className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg">
                                                        <div>
                                                            <p className="text-sm font-medium text-neutral-200">{alert.name}</p>
                                                            <p className="text-xs text-amber-400">ينفد خلال {alert.days_until_empty} يوم</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-amber-400">{alert.stock}</p>
                                                            <p className="text-xs text-neutral-500">متبقي</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-neutral-100 mb-4">🏆 أفضل المنتجات مبيعاً</h3>
                                    <div className="space-y-3">
                                        {data.topProducts.length > 0 ? (
                                            data.topProducts.map((product, index) => (
                                                <div key={product.id} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-neutral-700 flex items-center justify-center">
                                                            <Box className="h-6 w-6 text-neutral-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-neutral-200">{product.name}</p>
                                                        <p className="text-sm text-neutral-500">{product.sales} مبيعات</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-400">{formatCurrency(product.revenue)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-neutral-500">
                                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>لا توجد بيانات مبيعات</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Customers Tab */}
                            {activeTab === 'customers' && (
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-neutral-100 mb-4">👥 أفضل العملاء</h3>
                                    <div className="space-y-3">
                                        {data.topCustomers.length > 0 ? (
                                            data.topCustomers.map((customer, index) => {
                                                const segment = CUSTOMER_SEGMENTS[customer.segment as keyof typeof CUSTOMER_SEGMENTS] || CUSTOMER_SEGMENTS.new;
                                                return (
                                                    <div key={customer.id} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-neutral-200">{customer.name}</p>
                                                                <span className={`px-2 py-0.5 text-xs rounded-full ${segment.bg} ${segment.color}`}>
                                                                    {segment.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-neutral-500">{customer.email}</p>
                                                        </div>
                                                        <div className="text-center px-4">
                                                            <p className="text-lg font-bold text-blue-400">{customer.orders}</p>
                                                            <p className="text-xs text-neutral-500">طلبات</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-emerald-400">{formatCurrency(customer.total_spent)}</p>
                                                            <p className="text-xs text-neutral-500">إجمالي الإنفاق</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-neutral-500">
                                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>لا توجد بيانات عملاء</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Insights Tab */}
                            {activeTab === 'insights' && (
                                <div className="space-y-6">
                                    {/* AI Insights */}
                                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <Lightbulb className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-neutral-100">🤖 رؤى ذكية</h3>
                                                <p className="text-sm text-neutral-400">توصيات مبنية على بياناتك</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.kpis.aov < 50 && (
                                                <div className="p-4 bg-neutral-900/50 rounded-lg border border-amber-500/30">
                                                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                                                        <Target className="h-4 w-4" />
                                                        <span className="font-medium">زيادة قيمة السلة</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300">متوسط قيمة الطلب منخفض. أضف عروض "اشترِ 2 واحصل على خصم" لزيادة قيمة السلة.</p>
                                                </div>
                                            )}
                                            {data.stockAlerts.length > 0 && (
                                                <div className="p-4 bg-neutral-900/50 rounded-lg border border-red-500/30">
                                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <span className="font-medium">مخزون منخفض</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300">لديك {data.stockAlerts.length} منتجات على وشك النفاد. قم بتعبئة المخزون قريباً.</p>
                                                </div>
                                            )}
                                            {data.topProducts.length > 0 && (
                                                <div className="p-4 bg-neutral-900/50 rounded-lg border border-emerald-500/30">
                                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                                        <Star className="h-4 w-4" />
                                                        <span className="font-medium">منتج رائج</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-300">"{data.topProducts[0]?.name}" هو الأفضل مبيعاً. استثمر في إعلانات له!</p>
                                                </div>
                                            )}
                                            <div className="p-4 bg-neutral-900/50 rounded-lg border border-blue-500/30">
                                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                                    <Zap className="h-4 w-4" />
                                                    <span className="font-medium">نصيحة</span>
                                                </div>
                                                <p className="text-sm text-neutral-300">أضف صور عالية الجودة للمنتجات لزيادة معدل التحويل بنسبة 40%.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coming Soon */}
                                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 text-center">
                                        <Award className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-neutral-300 mb-2">قريباً...</h3>
                                        <p className="text-neutral-500 max-w-md mx-auto">
                                            نعمل على إضافة المزيد من الرؤى الذكية مثل التنبؤ بالمبيعات، تحليل الإعلانات، وتقارير الذكاء الاصطناعي الأسبوعية.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
