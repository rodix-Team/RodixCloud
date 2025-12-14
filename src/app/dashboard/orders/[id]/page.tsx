"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    ArrowLeft, ShoppingCart, User, MapPin, CreditCard,
    Clock, Truck, CheckCircle, XCircle, RefreshCw, Package,
    Printer, Mail, Phone, Calendar, DollarSign, ChevronDown, Check, LucideIcon
} from "lucide-react";

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    variant_name?: string;
    quantity: number;
    price: string;
    total: string;
    image_url?: string;
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

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
    pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Clock },
    processing: { label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: RefreshCw },
    shipped: { label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await http.get(`/orders/${resolvedParams.id}`);
                setOrder(res.data.data || res.data);
            } catch (err: any) {
                console.error("Failed to fetch order:", err);
                setError(err.response?.data?.message || 'Failed to load order details');
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
            setError(err.response?.data?.message || 'Failed to update status');
            setTimeout(() => setError(''), 3000);
        } finally {
            setUpdating(false);
            setShowStatusDropdown(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500" />
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
                        <ShoppingCart className="h-12 w-12 text-neutral-700 mb-4" />
                        <p className="text-neutral-400">Order not found</p>
                        <Link href="/dashboard/orders" className="mt-4 text-emerald-400 hover:text-emerald-300">
                            Back to Orders
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
                <div className="space-y-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/orders" className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Order #{order.order_number}</h1>
                                <p className="text-sm text-neutral-400">{formatDate(order.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Status Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    disabled={updating}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border ${statusConfig.bg} ${statusConfig.color}`}
                                >
                                    {updating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <StatusIcon className="h-4 w-4" />}
                                    {statusConfig.label}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {showStatusDropdown && (
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20">
                                        {ALL_STATUSES.map(status => {
                                            const cfg = STATUS_CONFIG[status];
                                            const Icon = cfg.icon;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(status)}
                                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg ${order.status === status ? cfg.color : 'text-neutral-300'}`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {cfg.label}
                                                    {order.status === status && <Check className="h-4 w-4 ml-auto" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg">
                                <Printer className="h-4 w-4" />
                                Print Invoice
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <DashboardSection>
                                <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-emerald-400" />
                                    Order Items ({order.items.length})
                                </h2>
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg">
                                            <div className="h-16 w-16 bg-neutral-700 rounded-lg flex items-center justify-center">
                                                <Package className="h-8 w-8 text-neutral-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-neutral-200">{item.product_name}</p>
                                                {item.variant_name && <p className="text-sm text-neutral-400">{item.variant_name}</p>}
                                                <p className="text-sm text-neutral-500">Qty: {item.quantity} × ${item.price}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-neutral-200">${item.total}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Order Totals */}
                                <div className="mt-6 pt-4 border-t border-neutral-700 space-y-2">
                                    <div className="flex justify-between text-sm"><span className="text-neutral-400">Subtotal</span><span className="text-neutral-200">${order.subtotal}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-neutral-400">Tax</span><span className="text-neutral-200">${order.tax}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-neutral-400">Shipping</span><span className="text-neutral-200">${order.shipping_cost}</span></div>
                                    {order.discount && parseFloat(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm"><span className="text-neutral-400">Discount</span><span className="text-emerald-400">-${order.discount}</span></div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-700">
                                        <span className="text-neutral-200">Total</span>
                                        <span className="text-emerald-400">${order.total}</span>
                                    </div>
                                </div>
                            </DashboardSection>

                            {/* Notes */}
                            {order.notes && (
                                <DashboardSection>
                                    <h2 className="text-lg font-semibold text-neutral-100 mb-4">Order Notes</h2>
                                    <p className="text-neutral-400">{order.notes}</p>
                                </DashboardSection>
                            )}
                        </div>

                        {/* Right Column - Customer & Shipping */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <DashboardSection>
                                <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-emerald-400" />
                                    Customer
                                </h2>
                                <div className="space-y-3">
                                    <p className="font-medium text-neutral-200">{order.customer_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Mail className="h-4 w-4" />
                                        {order.customer_email}
                                    </div>
                                    {order.customer_phone && (
                                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                                            <Phone className="h-4 w-4" />
                                            {order.customer_phone}
                                        </div>
                                    )}
                                </div>
                            </DashboardSection>

                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <DashboardSection>
                                    <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-emerald-400" />
                                        Shipping Address
                                    </h2>
                                    <p className="text-neutral-400 text-sm">{order.shipping_address}</p>
                                </DashboardSection>
                            )}

                            {/* Payment Info */}
                            <DashboardSection>
                                <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-emerald-400" />
                                    Payment
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Status</span>
                                        <span className={`font-medium ${order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </span>
                                    </div>
                                    {order.payment_method && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-400">Method</span>
                                            <span className="text-neutral-200">{order.payment_method}</span>
                                        </div>
                                    )}
                                </div>
                            </DashboardSection>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
