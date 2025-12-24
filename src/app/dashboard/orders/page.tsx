"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { http } from "@/lib/http";
import { useNotificationStore } from "@/store/notification-store";
import { useSettings } from "@/contexts/SettingsContext";
import {
  ShoppingCart, Search, Filter, Eye, Truck, Package,
  ChevronDown, Check, X, Clock, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, MoreHorizontal,
  Calendar, User, DollarSign, MapPin, Printer,
  ChevronLeft, ChevronRight, LucideIcon, Volume2, VolumeX, Bell
} from "lucide-react";

// Order Types
interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  product?: {
    id: number;
    name: string;
    image_url?: string;
    price?: string;
  };
  variant_name?: string;
  quantity: number;
  price: string;
  total?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  guest_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_orders_count?: number;
  items: OrderItem[];
  items_count?: number;
  subtotal: string;
  tax: string;
  shipping_cost: string;
  total: string;
  status: OrderStatus;
  payment_status: string;
  fulfillment_status?: string;
  delivery_status?: string;
  delivery_method?: string;
  channel?: string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  total: number;
}

// Status configurations
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: RefreshCw },
  shipped: { label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<number | null>(null);
  const [hoveredCustomer, setHoveredCustomer] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const previousTotalRef = useRef<number>(0);

  // Notification store
  const { addNotification, soundEnabled, toggleSound, lastOrderCount, setLastOrderCount } = useNotificationStore();

  // Settings for currency
  const { formatPrice } = useSettings();

  // Fetch orders
  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await http.get(`/orders?${params.toString()}`);
      setOrders(res.data.data || []);
      setCurrentPage(res.data.current_page || 1);
      setTotalPages(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err.response?.data?.message || 'Failed to load orders. Please check your connection.');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  // Polling for real-time updates (every 10 seconds)
  useEffect(() => {
    if (!isPolling) return;

    const pollOrders = async () => {
      try {
        const res = await http.get(`/orders?page=1`);
        const newTotal = res.data.total || 0;
        const newOrders = res.data.data || [];

        // Check if there are new orders
        if (previousTotalRef.current > 0 && newTotal > previousTotalRef.current) {
          const newOrderCount = newTotal - previousTotalRef.current;
          const latestOrder = newOrders[0];

          addNotification({
            type: "order",
            title: `🎉 طلب جديد #${latestOrder?.order_number || ''}`,
            message: `${latestOrder?.customer_name || 'Unknown'} - ${formatPrice(parseFloat(latestOrder?.total || '0'))}`,
            data: { orderId: latestOrder?.id }
          });

          // Update orders list if on page 1
          if (currentPage === 1) {
            setOrders(newOrders);
            setTotal(newTotal);
          }
        }

        previousTotalRef.current = newTotal;
        setLastOrderCount(newTotal);
        setLastPoll(new Date());
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial set
    if (previousTotalRef.current === 0 && total > 0) {
      previousTotalRef.current = total;
      setLastOrderCount(total);
    }

    const interval = setInterval(pollOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [isPolling, currentPage, total, addNotification, setLastOrderCount]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !search ||
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Update order status
  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await http.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingStatus(null);
      setShowStatusDropdown(null);
    }
  };

  // Select handlers
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    ALL_STATUSES.forEach(status => {
      counts[status] = orders.filter(o => o.status === status).length;
    });
    return counts;
  }, [orders]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">Orders</h1>
                <p className="text-sm text-neutral-400">Manage and track customer orders</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{total} orders</span>
              </div>
              {/* Real-time indicator */}
              {isPolling && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-400">Live</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sound toggle */}
              <button
                onClick={toggleSound}
                className={`p-2.5 rounded-lg transition-colors ${soundEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              {/* Polling toggle */}
              <button
                onClick={() => setIsPolling(!isPolling)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isPolling
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-800 text-neutral-400'
                  }`}
              >
                {isPolling ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <button
                onClick={() => fetchOrders(currentPage)}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Last poll info */}
          {lastPoll && (
            <div className="text-xs text-neutral-500">
              آخر تحديث: {lastPoll.toLocaleTimeString('ar-SA')} • التحديث التالي خلال 10 ثواني
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'all'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
            >
              All Orders
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-neutral-700">{statusCounts.all}</span>
            </button>
            {ALL_STATUSES.map(status => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                    ? `${config.bg} ${config.color} border`
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                  {statusCounts[status] > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-neutral-700">{statusCounts[status]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Orders Table */}
          <DashboardSection>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-neutral-700 mb-4" />
                <p className="text-neutral-400">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="w-12 py-3 px-4">
                        <button
                          onClick={selectAll}
                          className="text-neutral-400 hover:text-neutral-200"
                        >
                          {selectedIds.size === filteredOrders.length && filteredOrders.length > 0 ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <div className="h-5 w-5 rounded border border-neutral-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Order</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const statusConfig = STATUS_CONFIG[order.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-neutral-800/50 transition-colors ${selectedIds.has(order.id) ? 'bg-emerald-500/5' : 'hover:bg-neutral-800/30'
                            }`}
                        >
                          <td className="py-4 px-4">
                            <button
                              onClick={() => toggleSelect(order.id)}
                              className="text-neutral-400 hover:text-neutral-200"
                            >
                              {selectedIds.has(order.id) ? (
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <div className="h-5 w-5 rounded border border-neutral-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                            >
                              #{order.order_number}
                            </Link>
                          </td>
                          <td className="py-4 px-4 relative">
                            {/* Customer with Hover Popup */}
                            <div
                              className="relative"
                              onMouseEnter={() => setHoveredCustomer(order.id)}
                              onMouseLeave={() => setHoveredCustomer(null)}
                            >
                              <p className="text-sm font-medium text-neutral-200 cursor-pointer hover:text-emerald-400">
                                {order.customer_name || order.guest_email || 'Guest'}
                              </p>
                              <p className="text-xs text-neutral-500">{order.customer_email}</p>

                              {/* Customer Popup */}
                              {hoveredCustomer === order.id && (
                                <div className="absolute left-0 top-full mt-1 z-50 w-64 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl">
                                  <p className="text-sm font-medium text-neutral-100">{order.customer_name || 'Guest'}</p>
                                  {order.shipping_address && (
                                    <p className="text-xs text-neutral-400 mt-1 flex items-start gap-1">
                                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      {order.shipping_address}
                                    </p>
                                  )}
                                  {order.customer_phone && (
                                    <p className="text-xs text-neutral-400 mt-1">📞 {order.customer_phone}</p>
                                  )}
                                  <Link
                                    href={`/dashboard/customers`}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 block"
                                  >
                                    View customer →
                                  </Link>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 relative">
                            {/* Items with Dropdown */}
                            <button
                              onClick={() => setExpandedItems(expandedItems === order.id ? null : order.id)}
                              className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
                            >
                              <span>{order.items_count || order.items?.length || 0} items</span>
                              <ChevronDown className={`h-3 w-3 transition-transform ${expandedItems === order.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Items Dropdown */}
                            {expandedItems === order.id && order.items && order.items.length > 0 && (
                              <div className="absolute left-0 top-full mt-1 z-50 w-72 p-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl">
                                {order.items.slice(0, 5).map((item, idx) => {
                                  const imgUrl = item.product?.image_url || item.product_image;
                                  const productName = item.product?.name || item.product_name || 'Product';
                                  return (
                                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-neutral-700/50 rounded">
                                      <div className="h-10 w-10 bg-neutral-700 rounded flex items-center justify-center overflow-hidden">
                                        {imgUrl ? (
                                          <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                          <Package className="h-5 w-5 text-neutral-500" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs text-neutral-200 truncate">{productName}</p>
                                        {item.variant_name && (
                                          <p className="text-[10px] text-neutral-500">{item.variant_name}</p>
                                        )}
                                      </div>
                                      <span className="text-xs text-neutral-400">×{item.quantity}</span>
                                    </div>
                                  );
                                })}
                                {order.items.length > 5 && (
                                  <p className="text-xs text-neutral-500 text-center py-1">
                                    +{order.items.length - 5} more
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-neutral-200">{formatPrice(parseFloat(order.total))}</span>
                          </td>
                          <td className="py-4 px-4 relative">
                            <button
                              onClick={() => setShowStatusDropdown(showStatusDropdown === order.id ? null : order.id)}
                              disabled={updatingStatus === order.id}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${statusConfig.bg} ${statusConfig.color}`}
                            >
                              {updatingStatus === order.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <StatusIcon className="h-3 w-3" />
                              )}
                              {statusConfig.label}
                              <ChevronDown className="h-3 w-3" />
                            </button>

                            {/* Status dropdown */}
                            {showStatusDropdown === order.id && (
                              <div className="absolute top-full left-0 mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20">
                                {ALL_STATUSES.map(status => {
                                  const config = STATUS_CONFIG[status];
                                  const Icon = config.icon;
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => updateStatus(order.id, status)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg ${order.status === status ? config.color : 'text-neutral-300'
                                        }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                      {config.label}
                                      {order.status === status && <Check className="h-4 w-4 ml-auto" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-neutral-400">{formatDate(order.created_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/dashboard/orders/${order.id}`}
                                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Print Invoice"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </DashboardSection>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
