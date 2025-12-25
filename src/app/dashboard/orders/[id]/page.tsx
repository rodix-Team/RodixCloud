"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import {
    ArrowLeft, ShoppingCart, User, MapPin, CreditCard,
    Clock, Truck, CheckCircle, XCircle, RefreshCw, Package,
    Printer, Mail, Phone, Calendar, ChevronDown, Check, LucideIcon,
    Copy, ExternalLink, MoreHorizontal, FileText, Send, Edit, Trash2
} from "lucide-react";

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
    id: number;
    product_id: number;
    product_name?: string;
    variant_name?: string;
    quantity: number;
    price: string;
    total?: string;
    image_url?: string;
    // Backend may return product object with details
    product?: {
        id: number;
        name: string;
        image_url?: string;
        price?: string;
    };
    // Or variant object
    variant?: {
        id: number;
        name?: string;
        sku?: string;
        price?: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: OrderItem[];
    subtotal: string;
    tax: string;
    shipping_cost: string;
    discount?: string;
    total: string;
    status: OrderStatus;
    payment_status: string;
    payment_method?: string;
    shipping_address?: string;
    billing_address?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; labelAr: string; color: string; bg: string; icon: LucideIcon; gradient: string }> = {
    pending: {
        label: 'Pending',
        labelAr: 'قيد الانتظار',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: Clock,
        gradient: 'from-amber-500 to-orange-500'
    },
    processing: {
        label: 'Processing',
        labelAr: 'قيد المعالجة',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30',
        icon: RefreshCw,
        gradient: 'from-blue-500 to-cyan-500'
    },
    shipped: {
        label: 'Shipped',
        labelAr: 'تم الشحن',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/30',
        icon: Truck,
        gradient: 'from-purple-500 to-pink-500'
    },
    delivered: {
        label: 'Delivered',
        labelAr: 'تم التوصيل',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-green-500'
    },
    cancelled: {
        label: 'Cancelled',
        labelAr: 'ملغي',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        icon: XCircle,
        gradient: 'from-red-500 to-rose-500'
    },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await http.get(`/orders/${resolvedParams.id}`);
                const orderData = res.data.data || res.data;
                console.log('📦 Order Data:', orderData);
                console.log('📦 Order Items:', orderData?.items);
                setOrder(orderData);
            } catch (err: any) {
                console.error("Failed to fetch order:", err);
                setError(err.response?.data?.message || 'فشل في تحميل تفاصيل الطلب');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [resolvedParams.id]);

    const updateStatus = async (newStatus: OrderStatus) => {
        if (!order) return;
        setUpdating(true);
        try {
            await http.put(`/orders/${order.id}`, { status: newStatus });
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (err: any) {
            console.error("Failed to update status:", err);
            setError(err.response?.data?.message || 'فشل في تحديث الحالة');
            setTimeout(() => setError(''), 3000);
        } finally {
            setUpdating(false);
            setShowStatusDropdown(false);
        }
    };

    const copyOrderNumber = () => {
        if (order) {
            navigator.clipboard.writeText(order.order_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-MA', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-emerald-500 mx-auto mb-4" />
                            <p className="text-neutral-400">جاري تحميل تفاصيل الطلب...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!order) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                            <ShoppingCart className="h-10 w-10 text-neutral-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-neutral-200 mb-2">الطلب غير موجود</h2>
                        <p className="text-neutral-400 mb-6">لم نتمكن من العثور على هذا الطلب</p>
                        <Link href="/dashboard/orders" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
                            العودة للطلبات
                        </Link>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    const statusConfig = STATUS_CONFIG[order.status];
    const StatusIcon = statusConfig.icon;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
                    {/* Header */}
                    <div className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/dashboard/orders"
                                        className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-bold text-white">
                                                طلب #{order.order_number}
                                            </h1>
                                            <button
                                                onClick={copyOrderNumber}
                                                className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
                                                title="نسخ رقم الطلب"
                                            >
                                                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-400 mt-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {/* Status Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            disabled={updating}
                                            className={`inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${statusConfig.bg} ${statusConfig.color} hover:scale-105`}
                                        >
                                            {updating ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <StatusIcon className="h-4 w-4" />
                                            )}
                                            {statusConfig.labelAr}
                                            <ChevronDown className={`h-4 w-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showStatusDropdown && (
                                            <>
                                                <div className="fixed inset-0" onClick={() => setShowStatusDropdown(false)} />
                                                <div className="absolute top-full right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                    <div className="p-2">
                                                        {ALL_STATUSES.map(status => {
                                                            const cfg = STATUS_CONFIG[status];
                                                            const Icon = cfg.icon;
                                                            const isActive = order.status === status;
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => updateStatus(status)}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ${isActive
                                                                        ? `bg-gradient-to-r ${cfg.gradient} text-white`
                                                                        : 'text-neutral-300 hover:bg-neutral-700'
                                                                        }`}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                    <span className="flex-1 text-right">{cfg.labelAr}</span>
                                                                    {isActive && <Check className="h-4 w-4" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-xl transition-all hover:scale-105">
                                        <Printer className="h-4 w-4" />
                                        طباعة الفاتورة
                                    </button>

                                    <button className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="max-w-7xl mx-auto px-6 pt-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Order Items */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Order Items Card */}
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                                    <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                <Package className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">المنتجات المطلوبة</h2>
                                                <p className="text-sm text-neutral-400">{order.items.length} منتج</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-neutral-800">
                                        {order.items.map((item, index) => {
                                            // Extract data from item or nested product object
                                            const productName = item.product_name || item.product?.name || `المنتج #${item.product_id}`;
                                            const productImage = item.image_url || item.product?.image_url;
                                            const productPrice = item.price || item.product?.price || '0';
                                            const variantName = item.variant_name || item.variant?.name || item.variant?.sku;
                                            const itemTotal = item.total || (parseFloat(productPrice) * item.quantity).toFixed(2);

                                            return (
                                                <div key={item.id || index} className="p-6 flex items-center gap-5 hover:bg-neutral-800/30 transition-colors">
                                                    {/* Product Image */}
                                                    <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                                                        {productImage ? (
                                                            <img
                                                                src={getFullImageUrl(productImage)}
                                                                alt={productName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-neutral-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white text-lg truncate">
                                                            {productName}
                                                        </h3>
                                                        {variantName && (
                                                            <p className="text-sm text-neutral-400 mt-1">
                                                                المتغير: {variantName}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-sm text-neutral-500">
                                                                الكمية: <span className="text-white font-medium">{item.quantity}</span>
                                                            </span>
                                                            <span className="text-sm text-neutral-500">
                                                                السعر: <span className="text-white font-medium">{productPrice} درهم</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Total */}
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-400">
                                                            {itemTotal} درهم
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="p-6 bg-neutral-800/30 border-t border-neutral-800">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">المجموع الفرعي</span>
                                                <span className="text-white font-medium">{order.subtotal || 0} درهم</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">الضريبة</span>
                                                <span className="text-white font-medium">{order.tax || 0} درهم</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">تكلفة الشحن</span>
                                                <span className="text-white font-medium">{order.shipping_cost || 0} درهم</span>
                                            </div>
                                            {order.discount && parseFloat(order.discount) > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400">الخصم</span>
                                                    <span className="text-emerald-400 font-medium">-{order.discount} درهم</span>
                                                </div>
                                            )}
                                            <div className="pt-4 mt-4 border-t border-neutral-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-white">الإجمالي</span>
                                                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                                                        {order.total || 0} درهم
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {order.notes && (
                                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-amber-400" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-white">ملاحظات الطلب</h2>
                                        </div>
                                        <p className="text-neutral-300 leading-relaxed">{order.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Customer & Shipping */}
                            <div className="space-y-6">
                                {/* Customer Info Card */}
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-white">معلومات العميل</h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {(order.customer_name || 'G')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{order.customer_name || 'زائر'}</p>
                                                <p className="text-sm text-neutral-400">عميل</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-neutral-800">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="h-4 w-4 text-neutral-500" />
                                                <a href={`mailto:${order.customer_email}`} className="text-neutral-300 hover:text-emerald-400 transition-colors">
                                                    {order.customer_email}
                                                </a>
                                            </div>
                                            {order.customer_phone && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone className="h-4 w-4 text-neutral-500" />
                                                    <a href={`tel:${order.customer_phone}`} className="text-neutral-300 hover:text-emerald-400 transition-colors">
                                                        {order.customer_phone}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-sm text-white rounded-xl transition-all">
                                            <Send className="h-4 w-4" />
                                            إرسال رسالة
                                        </button>
                                    </div>
                                </div>

                                {/* Shipping Address Card */}
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-white">عنوان الشحن</h2>
                                    </div>
                                    <div className="p-5">
                                        {order.shipping_address ? (
                                            <p className="text-neutral-300 leading-relaxed">{order.shipping_address}</p>
                                        ) : (
                                            <p className="text-neutral-500 text-sm">لم يتم تحديد عنوان</p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Status Card */}
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                                    <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-green-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-white">الدفع</h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-400 text-sm">الحالة</span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.payment_status === 'paid'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {order.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                            </span>
                                        </div>
                                        {order.payment_method && (
                                            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                                                <span className="text-neutral-400 text-sm">طريقة الدفع</span>
                                                <span className="text-white font-medium">{order.payment_method}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
                                    <h3 className="text-sm font-medium text-neutral-400 mb-4">إجراءات سريعة</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex flex-col items-center gap-2 p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all">
                                            <Edit className="h-5 w-5 text-blue-400" />
                                            <span className="text-xs text-neutral-300">تعديل</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all">
                                            <Printer className="h-5 w-5 text-purple-400" />
                                            <span className="text-xs text-neutral-300">طباعة</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all">
                                            <Send className="h-5 w-5 text-emerald-400" />
                                            <span className="text-xs text-neutral-300">إرسال</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 bg-neutral-800 hover:bg-red-900/30 rounded-xl transition-all">
                                            <Trash2 className="h-5 w-5 text-red-400" />
                                            <span className="text-xs text-neutral-300">حذف</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
