"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    Users, Search, Mail, Phone, Calendar, ShoppingCart,
    DollarSign, Eye, MoreVertical, Loader2, User, MapPin,
    ChevronLeft, ChevronRight, RefreshCw, UserPlus, X
} from "lucide-react";

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    orders_count: number;
    total_spent: number;
    created_at: string;
    last_order_at?: string;
}

interface CustomersResponse {
    data: Customer[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch customers from API
    const fetchCustomers = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const response = await http.get(`/customers?page=${page}&search=${search}`);
            if (response.data.data) {
                setCustomers(response.data.data);
                setCurrentPage(response.data.current_page || 1);
                setTotalPages(response.data.last_page || 1);
                setTotal(response.data.total || 0);
            }
        } catch (err: any) {
            console.error("Failed to fetch customers:", err);
            setError(err.response?.data?.message || 'Failed to load customers. Please try again.');
            setCustomers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchCustomers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const filteredCustomers = useMemo(() => {
        if (!search) return customers;
        const lowerSearch = search.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(lowerSearch) ||
            c.email.toLowerCase().includes(lowerSearch) ||
            c.phone?.includes(search)
        );
    }, [customers, search]);

    return (
        <ProtectedRoute>
            <DashboardLayout title="Store" subtitle="Customers">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Customers</h1>
                                <p className="text-sm text-neutral-400">Manage your customer base</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">{total} customers</span>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchCustomers(currentPage)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                            <Users className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Error Loading Customers</p>
                                <p className="text-red-400/80 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    {/* Customers Table */}
                    <DashboardSection>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-neutral-700 mb-4" />
                                <p className="text-neutral-400">No customers found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-800">
                                            <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Customer</th>
                                            <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Contact</th>
                                            <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Orders</th>
                                            <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Total Spent</th>
                                            <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Last Order</th>
                                            <th className="text-right py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-neutral-200">{customer.name}</p>
                                                            <p className="text-xs text-neutral-500">
                                                                Customer since {formatDate(customer.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {customer.email}
                                                        </div>
                                                        {customer.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                                <Phone className="h-3.5 w-3.5" />
                                                                {customer.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingCart className="h-4 w-4 text-neutral-500" />
                                                        <span className="text-neutral-200">{customer.orders_count}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-emerald-400 font-medium">
                                                        {formatCurrency(customer.total_spent)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-neutral-400">
                                                        {customer.last_order_at ? formatDate(customer.last_order_at) : 'Never'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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
