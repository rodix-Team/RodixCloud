"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import {
    ArrowLeft, Save, Loader2, Package, Columns, X, Check,
    ChevronDown, Search, Eye, EyeOff, Trash2
} from "lucide-react";

import React from "react";

// Variant type for variable products
type ProductVariant = {
    id: number;
    name: string;
    sku: string | null;
    barcode: string | null;
    price: string | null;
    compare_at_price: string | null;
    cost: string | null;
    stock: number;
    weight: number | null;
    weight_unit: string | null;
    image_url: string | null;
    color: string | null;
    size: string | null;
    material: string | null;
    status: string; // active or draft
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: string | null;
    compare_at_price: string | null;
    cost: string | null;
    sku: string | null;
    barcode: string | null;
    stock: number;
    status: string;
    type: string;
    image_url: string | null;
    weight: number | null;
    weight_unit: string | null;
    brand: string | null;
    product_type: string | null;
    tags: string[] | null;
    // Additional fields
    material: string | null;
    color: string | null;
    size: string | null;
    handle: string | null;
    seo_title: string | null;
    seo_description: string | null;
    template: string | null;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    dimensions_length: number | null;
    dimensions_width: number | null;
    dimensions_height: number | null;
    country_of_origin: string | null;
    hs_code: string | null;
    // Variants for variable products
    variants?: ProductVariant[];
};

// All available columns for bulk edit - grouped by category
const BULK_COLUMNS = [
    // General
    { id: "name", label: "Product title", default: true, type: "text", group: "General" },
    { id: "description", label: "Description", default: false, type: "textarea", group: "General" },
    { id: "handle", label: "URL Handle", default: false, type: "text", group: "General" },
    { id: "status", label: "Status", default: true, type: "select", group: "General" },

    // Media
    { id: "image_url", label: "Image URL", default: false, type: "text", group: "Media" },

    // Pricing
    { id: "price", label: "Price", default: true, type: "number", group: "Pricing" },
    { id: "compare_at_price", label: "Compare price", default: true, type: "number", group: "Pricing" },
    { id: "cost", label: "Cost per item", default: true, type: "number", group: "Pricing" },
    { id: "taxable", label: "Taxable", default: false, type: "boolean", group: "Pricing" },

    // Inventory
    { id: "sku", label: "SKU", default: true, type: "text", group: "Inventory" },
    { id: "barcode", label: "Barcode", default: true, type: "text", group: "Inventory" },
    { id: "stock", label: "Stock quantity", default: true, type: "number", group: "Inventory" },

    // Shipping
    { id: "weight", label: "Weight", default: true, type: "number", group: "Shipping" },
    { id: "weight_unit", label: "Weight unit", default: false, type: "select-unit", group: "Shipping" },
    { id: "dimensions_length", label: "Length", default: false, type: "number", group: "Shipping" },
    { id: "dimensions_width", label: "Width", default: false, type: "number", group: "Shipping" },
    { id: "dimensions_height", label: "Height", default: false, type: "number", group: "Shipping" },
    { id: "requires_shipping", label: "Requires shipping", default: false, type: "boolean", group: "Shipping" },
    { id: "country_of_origin", label: "Country of origin", default: false, type: "text", group: "Shipping" },
    { id: "hs_code", label: "HS Code", default: false, type: "text", group: "Shipping" },

    // Product details
    { id: "material", label: "Material", default: true, type: "text", group: "Details" },
    { id: "color", label: "Color", default: true, type: "text", group: "Details" },
    { id: "size", label: "Size", default: false, type: "text", group: "Details" },

    // Organization
    { id: "product_type", label: "Product category", default: true, type: "text", group: "Organization" },
    { id: "brand", label: "Vendor / Brand", default: true, type: "text", group: "Organization" },
    { id: "tags", label: "Tags", default: true, type: "tags", group: "Organization" },
    { id: "template", label: "Template", default: false, type: "text", group: "Organization" },

    // SEO
    { id: "seo_title", label: "SEO Title", default: false, type: "text", group: "SEO" },
    { id: "seo_description", label: "SEO Description", default: false, type: "textarea", group: "SEO" },
];

// Loading fallback for Suspense
function BulkEditLoading() {
    return (
        <ProtectedRoute>
            <DashboardLayout title="Bulk Edit" subtitle="Loading...">
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// Main page component wrapped in Suspense
export default function BulkEditPage() {
    return (
        <Suspense fallback={<BulkEditLoading />}>
            <BulkEditContent />
        </Suspense>
    );
}

function BulkEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [changes, setChanges] = useState<Map<number, Partial<Product>>>(new Map());
    const [variantChanges, setVariantChanges] = useState<Map<number, Partial<ProductVariant>>>(new Map());

    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() =>
        new Set(BULK_COLUMNS.filter(c => c.default).map(c => c.id))
    );
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [columnSearch, setColumnSearch] = useState("");

    // Scroll sync refs for top scrollbar
    const topScrollRef = useRef<HTMLDivElement>(null);
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const [tableWidth, setTableWidth] = useState(0);

    // Sync scroll between top and main containers
    const handleTopScroll = useCallback(() => {
        if (topScrollRef.current && mainScrollRef.current) {
            mainScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
        }
    }, []);

    const handleMainScroll = useCallback(() => {
        if (topScrollRef.current && mainScrollRef.current) {
            topScrollRef.current.scrollLeft = mainScrollRef.current.scrollLeft;
            // Update table width for top scrollbar
            const table = mainScrollRef.current.querySelector('table');
            if (table && table.scrollWidth !== tableWidth) {
                setTableWidth(table.scrollWidth);
            }
        }
    }, [tableWidth]);

    // Calculate table width on mount and when products/columns change
    useEffect(() => {
        const updateWidth = () => {
            if (mainScrollRef.current) {
                const table = mainScrollRef.current.querySelector('table');
                if (table) {
                    setTableWidth(table.scrollWidth);
                }
            }
        };

        // Small delay to ensure table is rendered
        const timer = setTimeout(updateWidth, 100);
        return () => clearTimeout(timer);
    }, [products, visibleColumns]);


    // Fetch selected products
    useEffect(() => {
        const fetchProducts = async () => {
            const idsParam = searchParams.get("ids");
            if (!idsParam) {
                router.push("/dashboard/products");
                return;
            }

            try {
                setLoading(true);
                const ids = idsParam.split(",").map(Number).filter(id => !isNaN(id));

                if (ids.length === 0) {
                    router.push("/dashboard/products");
                    return;
                }

                // Fetch each product individually to ensure we get all of them
                const productPromises = ids.map(id =>
                    http.get(`/products/${id}`).then(res => res.data.data || res.data).catch(() => null)
                );

                const results = await Promise.all(productPromises);
                const validProducts = results.filter((p): p is Product => p !== null);

                if (validProducts.length === 0) {
                    setError("No products found");
                    return;
                }

                setProducts(validProducts);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams, router]);

    // Update a cell value
    const updateCell = useCallback((productId: number, field: string, value: any) => {
        setChanges(prev => {
            const newChanges = new Map(prev);
            const existing = newChanges.get(productId) || {};
            newChanges.set(productId, { ...existing, [field]: value });
            return newChanges;
        });

        // Also update local state for immediate feedback
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, [field]: value } : p
        ));
    }, []);

    // Update a variant cell value
    const updateVariant = useCallback((productId: number, variantId: number, field: string, value: any) => {
        setVariantChanges(prev => {
            const newChanges = new Map(prev);
            const existing = newChanges.get(variantId) || {};
            newChanges.set(variantId, { ...existing, [field]: value });
            return newChanges;
        });

        // Also update local state for immediate feedback
        setProducts(prev => prev.map(p => {
            if (p.id === productId && p.variants) {
                return {
                    ...p,
                    variants: p.variants.map(v =>
                        v.id === variantId ? { ...v, [field]: value } : v
                    )
                };
            }
            return p;
        }));
    }, []);

    // State for deleted variants (to be sent to API on save)
    const [deletedVariants, setDeletedVariants] = useState<{ productId: number, variantId: number }[]>([]);

    // Delete a variant
    const deleteVariant = useCallback((productId: number, variantId: number) => {
        // Add to deleted list
        setDeletedVariants(prev => [...prev, { productId, variantId }]);

        // Remove from local state immediately
        setProducts(prev => prev.map(p => {
            if (p.id === productId && p.variants) {
                return {
                    ...p,
                    variants: p.variants.filter(v => v.id !== variantId)
                };
            }
            return p;
        }));

        // Remove from variantChanges if exists
        setVariantChanges(prev => {
            const newChanges = new Map(prev);
            newChanges.delete(variantId);
            return newChanges;
        });
    }, []);

    // Save all changes
    const handleSaveAll = async () => {
        if (changes.size === 0 && variantChanges.size === 0 && deletedVariants.length === 0) return;

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            // Save product changes
            const productPromises = Array.from(changes.entries()).map(([productId, productChanges]) => {
                // Process tags if present
                const payload = { ...productChanges };
                if (payload.tags && typeof payload.tags === "string") {
                    payload.tags = (payload.tags as string).split(",").map(t => t.trim()).filter(t => t);
                }
                return http.put(`/products/${productId}`, payload);
            });

            // Save variant changes
            const variantPromises = Array.from(variantChanges.entries()).map(([variantId, variantChange]) => {
                // Find the parent product for this variant
                const parentProduct = products.find(p =>
                    p.variants?.some(v => v.id === variantId)
                );
                if (parentProduct) {
                    return http.put(`/products/${parentProduct.id}/variants/${variantId}`, variantChange);
                }
                return Promise.resolve();
            });

            // Delete variants
            const deletePromises = deletedVariants.map(({ productId, variantId }) =>
                http.delete(`/products/${productId}/variants/${variantId}`)
            );

            await Promise.all([...productPromises, ...variantPromises, ...deletePromises]);
            const savedCount = changes.size + variantChanges.size;
            const deletedCount = deletedVariants.length;
            setChanges(new Map());
            setVariantChanges(new Map());
            setDeletedVariants([]);

            const messages = [];
            if (savedCount > 0) messages.push(`${savedCount} item(s) saved`);
            if (deletedCount > 0) messages.push(`${deletedCount} variant(s) deleted`);
            setSuccessMessage(`✅ ${messages.join(', ')}!`);

            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            console.error("Failed to save changes:", err);
            setError(err.response?.data?.message || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    // Toggle column visibility
    const toggleColumn = (columnId: string) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnId)) {
                newSet.delete(columnId);
            } else {
                newSet.add(columnId);
            }
            return newSet;
        });
    };

    // Get cell value
    const getCellValue = (product: Product, field: string): string => {
        const value = (product as any)[field];
        if (value === null || value === undefined) return "";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (Array.isArray(value)) return value.join(", ");
        return String(value);
    };

    // Render editable cell
    const renderCell = (product: Product, column: typeof BULK_COLUMNS[0]) => {
        const value = getCellValue(product, column.id);
        const hasChange = changes.get(product.id)?.[column.id as keyof Product] !== undefined;

        const baseClass = `w-full px-3 py-2 bg-transparent border-0 text-sm text-neutral-200 focus:outline-none focus:bg-neutral-800 transition-colors ${hasChange ? "bg-emerald-500/10" : ""}`;

        // Boolean fields (checkbox)
        if (column.type === "boolean") {
            const boolValue = (product as any)[column.id] === true;
            return (
                <label className="flex items-center justify-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={boolValue}
                        onChange={(e) => updateCell(product.id, column.id, e.target.checked)}
                        className={`w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer ${hasChange ? "ring-2 ring-emerald-500/50" : ""}`}
                    />
                </label>
            );
        }

        // Status select
        if (column.type === "select" && column.id === "status") {
            return (
                <select
                    value={value}
                    onChange={(e) => updateCell(product.id, column.id, e.target.value)}
                    className={`${baseClass} cursor-pointer`}
                >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                </select>
            );
        }

        // Weight unit select
        if (column.type === "select-unit") {
            return (
                <select
                    value={value || "kg"}
                    onChange={(e) => updateCell(product.id, column.id, e.target.value)}
                    className={`${baseClass} cursor-pointer`}
                >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                </select>
            );
        }

        // Number fields
        if (column.type === "number") {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => updateCell(product.id, column.id, e.target.value)}
                    className={baseClass}
                    step={column.id.includes("price") || column.id === "cost" || column.id === "weight" || column.id.includes("dimensions") ? "0.01" : "1"}
                />
            );
        }

        // Textarea for descriptions
        if (column.type === "textarea") {
            return (
                <textarea
                    value={value}
                    onChange={(e) => updateCell(product.id, column.id, e.target.value)}
                    className={`${baseClass} min-h-[60px] resize-none`}
                    rows={2}
                />
            );
        }

        // Default text input
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => updateCell(product.id, column.id, e.target.value)}
                className={baseClass}
            />
        );
    };

    // Render editable cell for variants
    const renderVariantCell = (productId: number, variant: ProductVariant, column: typeof BULK_COLUMNS[0]) => {
        const value = getCellValue(variant as any, column.id);
        const hasChange = variantChanges.get(variant.id)?.[column.id as keyof ProductVariant] !== undefined;

        const baseClass = `w-full px-3 py-2 bg-transparent border-0 text-sm text-neutral-200 focus:outline-none focus:bg-neutral-800 transition-colors ${hasChange ? "bg-emerald-500/10" : ""}`;

        // Status select for variants
        if (column.type === "select" && column.id === "status") {
            return (
                <select
                    value={value || "active"}
                    onChange={(e) => updateVariant(productId, variant.id, column.id, e.target.value)}
                    className={`${baseClass} cursor-pointer ${hasChange ? "ring-1 ring-emerald-500/50" : ""}`}
                >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                </select>
            );
        }

        // Weight unit select
        if (column.type === "select-unit") {
            return (
                <select
                    value={value || "kg"}
                    onChange={(e) => updateVariant(productId, variant.id, column.id, e.target.value)}
                    className={`${baseClass} cursor-pointer`}
                >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                </select>
            );
        }

        // Number fields
        if (column.type === "number") {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => updateVariant(productId, variant.id, column.id, e.target.value)}
                    className={baseClass}
                    step={column.id.includes("price") || column.id === "cost" || column.id === "weight" ? "0.01" : "1"}
                />
            );
        }

        // Default text input
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => updateVariant(productId, variant.id, column.id, e.target.value)}
                className={baseClass}
            />
        );
    };

    // Get unique groups for column selector
    const columnGroups = [...new Set(BULK_COLUMNS.map(c => c.group))];

    const filteredColumns = BULK_COLUMNS.filter(c =>
        c.label.toLowerCase().includes(columnSearch.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <DashboardLayout title="Bulk Edit" subtitle={`Editing ${products.length} products`}>
                <div className="flex flex-col h-[calc(100vh-120px)]">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/products"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-neutral-100">
                                    Editing {products.length} products
                                </h1>
                                <p className="text-xs text-neutral-500">
                                    {changes.size} unsaved changes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Column Selector Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 transition-colors"
                                >
                                    <Columns className="h-4 w-4" />
                                    Columns
                                    <span className="px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                                        {visibleColumns.size}
                                    </span>
                                </button>

                                {/* Column Selector Dropdown */}
                                {showColumnSelector && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="p-3 border-b border-neutral-800">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                                <input
                                                    type="text"
                                                    value={columnSearch}
                                                    onChange={(e) => setColumnSearch(e.target.value)}
                                                    placeholder="Search fields"
                                                    className="w-full pl-9 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto p-2">
                                            {columnGroups.map(group => {
                                                const groupCols = filteredColumns.filter(c => c.group === group);
                                                if (groupCols.length === 0) return null;
                                                return (
                                                    <div key={group} className="mb-2">
                                                        <p className="px-2 py-1 text-xs font-medium text-neutral-500 uppercase sticky top-0 bg-neutral-900">
                                                            {group}
                                                        </p>
                                                        {groupCols.map(col => (
                                                            <label
                                                                key={col.id}
                                                                className="flex items-center gap-3 px-2 py-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={visibleColumns.has(col.id)}
                                                                    onChange={() => toggleColumn(col.id)}
                                                                    className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-emerald-500 focus:ring-emerald-500/20"
                                                                />
                                                                <span className="text-sm text-neutral-300">{col.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="p-2 border-t border-neutral-800 flex gap-2">
                                            <button
                                                onClick={() => setVisibleColumns(new Set(BULK_COLUMNS.map(c => c.id)))}
                                                className="flex-1 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                            >
                                                Show all
                                            </button>
                                            <button
                                                onClick={() => setVisibleColumns(new Set(BULK_COLUMNS.filter(c => c.default).map(c => c.id)))}
                                                className="flex-1 px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-700 rounded-lg transition-colors"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveAll}
                                disabled={saving || (changes.size === 0 && variantChanges.size === 0 && deletedVariants.length === 0)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm animate-in slide-in-from-top-2">
                            {successMessage}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col mt-4">
                            {/* Top Scrollbar - Synced with main table */}
                            <div
                                ref={topScrollRef}
                                onScroll={handleTopScroll}
                                className="overflow-x-auto overflow-y-hidden border border-neutral-800 rounded-t-xl bg-neutral-900/50 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
                                style={{ height: '14px' }}
                            >
                                <div style={{ width: tableWidth > 0 ? tableWidth : '2000px', height: 10 }} />
                            </div>

                            {/* Main Table Container */}
                            <div
                                ref={mainScrollRef}
                                onScroll={handleMainScroll}
                                className="flex-1 overflow-auto border border-t-0 border-neutral-800 rounded-b-xl"
                            >
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-neutral-900 border-b border-neutral-800">
                                            {/* Product Image + Title (always visible) */}
                                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-900 z-20 min-w-[200px]">
                                                Product
                                            </th>
                                            {/* Dynamic columns */}
                                            {BULK_COLUMNS.filter(c => visibleColumns.has(c.id) && c.id !== "name").map(col => (
                                                <th
                                                    key={col.id}
                                                    className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]"
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <React.Fragment key={product.id}>
                                                {/* Parent Product Row */}
                                                <tr
                                                    className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 ${changes.has(product.id) ? "bg-emerald-500/5" : ""} ${product.type === "variable" ? "bg-amber-500/5" : ""}`}
                                                >
                                                    {/* Product Image + Title */}
                                                    <td className="py-2 px-4 sticky left-0 bg-neutral-950 z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                                                {product.image_url ? (
                                                                    <img
                                                                        src={getFullImageUrl(product.image_url)}
                                                                        alt=""
                                                                        className="h-10 w-10 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-neutral-600" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                {visibleColumns.has("name") ? (
                                                                    <input
                                                                        type="text"
                                                                        value={getCellValue(product, "name")}
                                                                        onChange={(e) => updateCell(product.id, "name", e.target.value)}
                                                                        className={`w-full px-2 py-1 bg-transparent border-0 text-sm font-medium text-neutral-200 focus:outline-none focus:bg-neutral-800 rounded ${changes.get(product.id)?.name !== undefined ? "bg-emerald-500/10" : ""}`}
                                                                    />
                                                                ) : (
                                                                    <p className="text-sm font-medium text-neutral-200 truncate">
                                                                        {product.name}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-neutral-500">
                                                                    {product.type}
                                                                    {product.type === "variable" && product.variants && (
                                                                        <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">
                                                                            {product.variants.length} variants
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Dynamic columns */}
                                                    {BULK_COLUMNS.filter(c => visibleColumns.has(c.id) && c.id !== "name").map(col => (
                                                        <td key={col.id} className="py-2 px-2">
                                                            {renderCell(product, col)}
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Variant Rows (for variable products) */}
                                                {product.type === "variable" && product.variants && product.variants.map((variant, vIndex) => (
                                                    <tr
                                                        key={`variant-${variant.id}`}
                                                        className={`border-b border-neutral-800/30 hover:bg-neutral-800/20 bg-neutral-900/50 ${changes.has(variant.id) ? "bg-emerald-500/5" : ""}`}
                                                    >
                                                        {/* Variant Name (indented) */}
                                                        <td className="py-2 px-4 sticky left-0 bg-neutral-900/80 z-10">
                                                            <div className="flex items-center gap-3 pl-6">
                                                                {/* Tree line indicator */}
                                                                <div className="absolute left-8 top-0 bottom-0 flex items-center">
                                                                    <div className={`w-4 h-px bg-neutral-700 ${vIndex === (product.variants?.length || 0) - 1 ? "" : ""}`} />
                                                                </div>
                                                                <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                                                    {variant.image_url ? (
                                                                        <img
                                                                            src={getFullImageUrl(variant.image_url)}
                                                                            alt=""
                                                                            className="h-8 w-8 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs text-neutral-500">↳</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm text-neutral-300 truncate">
                                                                        {variant.name || `${variant.color || ""} ${variant.size || ""}`.trim() || `Variant ${vIndex + 1}`}
                                                                    </p>
                                                                    <p className="text-xs text-neutral-600">variant</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Variant columns */}
                                                        {BULK_COLUMNS.filter(c => visibleColumns.has(c.id) && c.id !== "name").map(col => (
                                                            <td key={col.id} className="py-2 px-2">
                                                                {renderVariantCell(product.id, variant, col)}
                                                            </td>
                                                        ))}
                                                        {/* Delete button */}
                                                        <td className="py-2 px-2">
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete variant "${variant.name || `Variant ${vIndex + 1}`}"?`)) {
                                                                        deleteVariant(product.id, variant.id);
                                                                    }
                                                                }}
                                                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                title="Delete variant"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-4">
                        <span className="text-xs text-neutral-500">
                            {visibleColumns.size} columns visible
                        </span>
                        {(changes.size > 0 || variantChanges.size > 0 || deletedVariants.length > 0) && (
                            <span className="text-xs text-emerald-400">
                                {changes.size > 0 && `${changes.size} product(s) modified`}
                                {variantChanges.size > 0 && ` • ${variantChanges.size} variant(s) modified`}
                                {deletedVariants.length > 0 && <span className="text-red-400"> • {deletedVariants.length} variant(s) to delete</span>}
                                {" • Press Save to apply changes"}
                            </span>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
