"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Save, Loader2, Package, DollarSign, Box, Tag, Truck, Info } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { http } from "@/lib/http";
import { useSettings } from "@/contexts/SettingsContext";


type ImageItem = { id: string; url: string; isPrimary?: boolean; path?: string };

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
    gallery?: string[];
    weight: number | null;
    weight_unit: string | null;
    brand: string | null;
    product_type: string | null;
    tags: string[] | null;
};

type QuickEditModalProps = {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedProduct: Product) => void;
};

export function QuickEditModal({ product, isOpen, onClose, onSave }: QuickEditModalProps) {
    // Form state
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description || "");
    const [price, setPrice] = useState(product.price || "");
    const [compareAtPrice, setCompareAtPrice] = useState(product.compare_at_price || "");
    const [cost, setCost] = useState(product.cost || "");
    const [sku, setSku] = useState(product.sku || "");
    const [barcode, setBarcode] = useState(product.barcode || "");
    const [stock, setStock] = useState(String(product.stock || 0));
    const [weight, setWeight] = useState(String(product.weight || ""));
    const [weightUnit, setWeightUnit] = useState(product.weight_unit || "kg");
    const [brand, setBrand] = useState(product.brand || "");
    const [productType, setProductType] = useState(product.product_type || "");
    const [tags, setTags] = useState(product.tags?.join(", ") || "");
    const [status, setStatus] = useState(product.status);

    // Images
    const [images, setImages] = useState<ImageItem[]>(() => {
        const imgs: ImageItem[] = [];
        if (product.image_url) {
            imgs.push({ id: "primary", url: product.image_url, isPrimary: true });
        }
        if (product.gallery) {
            product.gallery.forEach((url, i) => {
                imgs.push({ id: `gallery-${i}`, url, isPrimary: false });
            });
        }
        return imgs;
    });

    // UI state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "inventory" | "organization">("basic");
    const { formatPrice, getCurrencySymbol } = useSettings();

    // Reset form when product changes
    useEffect(() => {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price || "");
        setCompareAtPrice(product.compare_at_price || "");
        setCost(product.cost || "");
        setSku(product.sku || "");
        setBarcode(product.barcode || "");
        setStock(String(product.stock || 0));
        setWeight(String(product.weight || ""));
        setWeightUnit(product.weight_unit || "kg");
        setBrand(product.brand || "");
        setProductType(product.product_type || "");
        setTags(product.tags?.join(", ") || "");
        setStatus(product.status);

        const imgs: ImageItem[] = [];
        if (product.image_url) {
            imgs.push({ id: "primary", url: product.image_url, isPrimary: true });
        }
        if (product.gallery) {
            product.gallery.forEach((url, i) => {
                imgs.push({ id: `gallery-${i}`, url, isPrimary: false });
            });
        }
        setImages(imgs);
        setError("");
    }, [product]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            const primaryImage = images.find(img => img.isPrimary)?.url || images[0]?.url || null;
            const gallery = images.filter(img => !img.isPrimary && img.url !== primaryImage).map(img => img.url);

            const payload: any = {
                name,
                description: description || null,
                price: parseFloat(price) || 0,
                compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
                cost: cost ? parseFloat(cost) : null,
                sku: sku || null,
                barcode: barcode || null,
                stock: parseInt(stock) || 0,
                weight: weight ? parseFloat(weight) : null,
                weight_unit: weightUnit,
                brand: brand || null,
                product_type: productType || null,
                tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : [],
                status,
                image_url: primaryImage,
                gallery: gallery.length > 0 ? gallery : null,
            };

            const response = await http.put(`/products/${product.id}`, payload);

            onSave({
                ...product,
                ...payload,
                price: String(payload.price),
                compare_at_price: payload.compare_at_price ? String(payload.compare_at_price) : null,
                cost: payload.cost ? String(payload.cost) : null,
            });

            onClose();
        } catch (err: any) {
            console.error("Failed to update product:", err);
            const message = err.response?.data?.message || err.response?.data?.errors || "Failed to update product";
            if (typeof message === "object") {
                setError(Object.values(message).flat().join(", "));
            } else {
                setError(message);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "basic", label: "Basic", icon: Package },
        { id: "pricing", label: "Pricing", icon: DollarSign },
        { id: "inventory", label: "Inventory", icon: Box },
        { id: "organization", label: "Organization", icon: Tag },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                                <Package className="h-5 w-5 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-100">Quick Edit</h2>
                            <p className="text-xs text-neutral-500">ID: {product.id} • {product.type}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">Ctrl+S to save</span>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-neutral-800 px-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-emerald-500 text-emerald-400"
                                : "border-transparent text-neutral-400 hover:text-neutral-200"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Basic Tab */}
                    {activeTab === "basic" && (
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Product Images
                                </label>
                                <ImageUpload
                                    images={images}
                                    onChange={setImages}
                                    maxImages={6}
                                    showPrimarySelector={true}
                                    folder="products"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Status
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus("active")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === "active"
                                            ? "bg-emerald-500 text-white"
                                            : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700"
                                            }`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-white" : "bg-emerald-400"}`} />
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("draft")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === "draft"
                                            ? "bg-neutral-600 text-white"
                                            : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700"
                                            }`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${status === "draft" ? "bg-white" : "bg-neutral-400"}`} />
                                        Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === "pricing" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Price *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol()}</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Compare at Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol()}</span>
                                        <input
                                            type="number"
                                            value={compareAtPrice}
                                            onChange={(e) => setCompareAtPrice(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Cost per item
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol()}</span>
                                        <input
                                            type="number"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Profit Margin */}
                            {price && cost && parseFloat(price) > 0 && parseFloat(cost) > 0 && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-neutral-300">Profit:</span>
                                        <span className="font-semibold text-emerald-400">
                                            {formatPrice(parseFloat(price) - parseFloat(cost))}
                                        </span>
                                        <span className="text-neutral-300">Margin:</span>
                                        <span className="font-semibold text-emerald-400">
                                            {(((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === "inventory" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Barcode
                                    </label>
                                    <input
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        min="0"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Weight
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                                        />
                                        <select
                                            value={weightUnit}
                                            onChange={(e) => setWeightUnit(e.target.value)}
                                            className="px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                            <option value="lb">lb</option>
                                            <option value="oz">oz</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Organization Tab */}
                    {activeTab === "organization" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Brand / Vendor
                                    </label>
                                    <input
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="e.g., Nike, Apple"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Product Type / Category
                                    </label>
                                    <input
                                        type="text"
                                        value={productType}
                                        onChange={(e) => setProductType(e.target.value)}
                                        placeholder="e.g., T-Shirt, Electronics"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Tags <span className="text-neutral-500 text-xs">(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="summer, sale, new-arrival"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/80">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
