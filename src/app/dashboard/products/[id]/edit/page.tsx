"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import { useSettings } from "@/contexts/SettingsContext";
import {
    ArrowLeft, Save, Package, Loader2, Trash2,
    ChevronDown, ChevronUp, Image as ImageIcon, Tag, Layers,
    Plus, Edit2, Upload
} from "lucide-react";
import Link from "next/link";

// Helper function to upload variant image to server
async function uploadVariantImage(file: File): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append("images[]", file);
        formData.append("folder", "variants");

        const response = await http.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.data?.[0]?.url) {
            return getFullImageUrl(response.data.data[0].url);
        }
        return null;
    } catch (error) {
        console.error("❌ Failed to upload image:", error);
        return null;
    }
}

type Category = {
    id: number;
    name: string;
};

type Variant = {
    id: number;
    sku: string;
    price: string;
    stock: number;
    options: Record<string, string>;
    name: string;
    status: string;
    weight?: string;
    weight_unit?: string;
    image_url?: string;
    images?: string[]; // مصفوفة الصور (حتى 3 صور)
};

type ProductData = {
    id: number;
    name: string;
    sku: string;
    description: string;
    short_description: string;
    regular_price: string;
    sale_price: string;
    stock: number;
    status: string;
    type: string;
    image_url: string | null;
    weight: string;
    weight_unit: string;
    length: string;
    width: string;
    height: string;
    dimension_unit: string;
    categories: Category[];
    variants?: Variant[];
};

// Collapsible Section Component
function Section({
    title,
    icon,
    children,
    defaultOpen = true
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="text-emerald-400">{icon}</div>
                    <span className="text-sm font-medium text-neutral-200">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-neutral-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                )}
            </button>
            {isOpen && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { formatPrice, getCurrencySymbol } = useSettings();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Product data
    const [product, setProduct] = useState<ProductData | null>(null);
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [regularPrice, setRegularPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [stock, setStock] = useState("");
    const [status, setStatus] = useState("active");
    const [imageUrl, setImageUrl] = useState("");
    const [weight, setWeight] = useState("");
    const [weightUnit, setWeightUnit] = useState("kg");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [dimensionUnit, setDimensionUnit] = useState("cm");

    // Categories
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    // Variants (for variable products)
    const [productType, setProductType] = useState<string>("simple");
    const [variants, setVariants] = useState<Variant[]>([]);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await http.get(`/products/${productId}`);
                const data = response.data.data || response.data;

                setProduct(data);
                setName(data.name || "");
                setSku(data.sku || "");
                setDescription(data.description || "");
                setShortDescription(data.short_description || "");
                setRegularPrice(data.regular_price || data.price || "");
                setSalePrice(data.sale_price || "");
                setStock(String(data.stock || 0));
                setStatus(data.status || "active");
                setImageUrl(data.image_url || "");
                setWeight(data.weight || "");
                setWeightUnit(data.weight_unit || "kg");
                setLength(data.length || "");
                setWidth(data.width || "");
                setHeight(data.height || "");
                setDimensionUnit(data.dimension_unit || "cm");
                setSelectedCategories((data.categories || []).map((c: Category) => c.id));
                // Product type and variants
                setProductType(data.type || "simple");
                console.log("📦 Product data:", data);
                console.log("📦 Variants from API:", data.variants);
                if (data.variants) {
                    data.variants.forEach((v: Variant, i: number) => {
                        console.log(`📦 Variant ${i + 1}:`, {
                            id: v.id,
                            name: v.name,
                            image_url: v.image_url,
                            images: v.images,
                        });
                    });
                }
                setVariants(data.variants || []);
            } catch (err: any) {
                console.error("Failed to fetch product:", err);
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await http.get("/categories");
                setAllCategories(response.data.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        if (productId) {
            fetchProduct();
            fetchCategories();
        }
    }, [productId]);

    // Handle save
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Product name is required");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            // Prepare variants data for API (if variable product)
            // Filter out Base64 images (too large) - only send URLs
            const variantsData = productType === "variable" ? variants.map(v => ({
                id: v.id,
                sku: String(v.sku || ""), // Ensure SKU is always a string
                price: String(v.price || "0"),
                stock: Number(v.stock) || 0,
                status: v.status || "active",
                name: v.name || "",
                options: v.options || {},
                // Only send URL images, not Base64 (Base64 is too large for API)
                images: (v.images || []).filter(img => img && !img.startsWith("data:")),
            })) : undefined;

            const productData = {
                name: name.trim(),
                // Generate SKU if empty (backend requires it)
                sku: sku ? sku.trim() : `SKU-${productId}`,
                description: description ? description.trim() : "",
                short_description: shortDescription ? shortDescription.trim() : "",
                regular_price: regularPrice || "",
                sale_price: salePrice || "",
                stock: stock ? parseInt(stock) : 0,
                status,
                image_url: imageUrl || "",
                weight: weight || "",
                weight_unit: weightUnit || "kg",
                length: length || "",
                width: width || "",
                height: height || "",
                dimension_unit: dimensionUnit || "cm",
                categories: selectedCategories,
                type: productType,
                // Re-enabled variants
                ...(variantsData && { variants: variantsData }),
            };

            console.log("📤 Sending product data:", productData);
            console.log("📤 SKU value:", productData.sku, "Type:", typeof productData.sku);
            if (variantsData) {
                console.log("📤 Variants:", variantsData);
                variantsData.forEach((v, i) => console.log(`📤 Variant ${i} SKU:`, v.sku, "Type:", typeof v.sku));
            }
            await http.put(`/products/${productId}`, productData);
            setSuccess("تم تحديث المنتج بنجاح!");

            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to update product:", err);
            setError(err.response?.data?.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    // Open delete confirmation modal
    const handleDelete = () => {
        console.log("🗑️ Opening delete confirmation modal");
        setShowDeleteModal(true);
    };

    // Actually execute the delete
    const executeDelete = async () => {
        console.log("🗑️ Executing delete for product:", productId);
        setShowDeleteModal(false);
        try {
            setDeleting(true);
            console.log("🗑️ Sending delete request...");
            await http.delete(`/products/${productId}`);
            console.log("🗑️ Product deleted successfully!");
            router.push("/dashboard/products");
        } catch (err: any) {
            console.error("❌ Failed to delete product:", err);
            console.error("❌ Error details:", err.response?.data);
            setError(err.response?.data?.message || "فشل في حذف المنتج");
        } finally {
            setDeleting(false);
        }
    };

    // Toggle category selection
    const toggleCategory = (categoryId: number) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Add new variant
    const addVariant = async () => {
        try {
            const newVariantData = {
                sku: `VAR-${Date.now().toString().slice(-6)}`,
                price: 0,
                stock: 0,
                options: {},
                name: `متغير ${variants.length + 1}`,
                status: 'active',
                images: []
            };

            // Save to backend immediately
            const response = await http.post(`/products/${productId}/variants`, newVariantData);
            console.log('📦 Add variant response:', response.data);

            // Backend returns: { message, variant, variants }
            const savedVariant = response.data.variant;

            if (savedVariant && savedVariant.id) {
                setVariants(prev => [...prev, savedVariant]);
                setSuccess('تمت إضافة متغير جديد وحفظه');
                setTimeout(() => setSuccess(''), 2000);
            } else {
                // If response format is different, reload variants
                console.warn('Unexpected response format, reloading...');
                const productResponse = await http.get(`/products/${productId}`);
                const productData = productResponse.data.data || productResponse.data;
                setVariants(productData.variants || []);
                setSuccess('تمت إضافة المتغير');
            }
        } catch (err: any) {
            console.error('Failed to add variant:', err);
            setError(err.response?.data?.message || 'فشل في إضافة المتغير');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Delete variant
    const deleteVariant = async (variantId: number, index: number) => {
        console.log('🗑️ Delete variant clicked:', { variantId, index });

        // TEMP: Skip confirm for testing
        // const confirmed = window.confirm('هل أنت متأكد من حذف هذا المتغير؟');
        // console.log('🗑️ User confirmed:', confirmed);
        // if (!confirmed) return;

        try {
            console.log('🗑️ Deleting from backend...');
            // Delete from backend using correct route
            await http.delete(`/products/${productId}/variants/${variantId}`);
            console.log('🗑️ Backend delete successful');

            // Remove from local state
            setVariants(prev => prev.filter((_, i) => i !== index));
            setSuccess('تم حذف المتغير بنجاح');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err: any) {
            console.error('🗑️ Failed to delete variant:', err);
            console.error('🗑️ Error response:', err.response?.data);
            setError(err.response?.data?.message || 'فشل في حذف المتغير');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Products" subtitle="Edit Product">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!product) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Products" subtitle="Edit Product">
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                        <p className="text-neutral-400">Product not found</p>
                        <Link href="/dashboard/products" className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block">
                            Back to Products
                        </Link>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Products" subtitle="Edit Product">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-20">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/products"
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-neutral-400" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Edit Product</h1>
                                <p className="text-sm text-neutral-400">ID: {productId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Preview Button */}
                            <a
                                href={`/products/${productId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium rounded-lg transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </a>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Basic Info */}
                    <Section title="Basic Information" icon={<Package className="h-5 w-5" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">SKU</label>
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="SKU-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">نوع المنتج</label>
                                    <select
                                        value={productType}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            if (newType === 'variable' && productType === 'simple') {
                                                // Converting from simple to variable
                                                if (variants.length === 0) {
                                                    setSuccess('تم تحويل المنتج إلى متغير. أضف متغيرات الآن.');
                                                }
                                            } else if (newType === 'simple' && productType === 'variable') {
                                                // Converting from variable to simple
                                                if (variants.length > 0 && !confirm('سيتم حذف جميع المتغيرات. هل تريد المتابعة؟')) {
                                                    return;
                                                }
                                                setVariants([]);
                                                setSuccess('تم تحويل المنتج إلى بسيط.');
                                            }
                                            setProductType(newType);
                                            setTimeout(() => setSuccess(''), 3000);
                                        }}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="simple">🎯 منتج بسيط</option>
                                        <option value="variable">🎨 منتج متغير</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Full product description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Short Description</label>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Brief description..."
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Pricing - Hide for variable products */}
                    {productType !== "variable" && (
                        <Section title="Pricing" icon={<Tag className="h-5 w-5" />}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Regular Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={regularPrice}
                                        onChange={(e) => setRegularPrice(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Sale Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* Inventory - Hide for variable products */}
                    {productType !== "variable" && (
                        <Section title="Inventory" icon={<Package className="h-5 w-5" />}>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="0"
                                />
                            </div>
                        </Section>
                    )}

                    {/* Categories */}
                    <Section title="Categories" icon={<Tag className="h-5 w-5" />}>
                        <div className="space-y-3">
                            <p className="text-sm text-neutral-400">Select categories for this product:</p>

                            {allCategories.length === 0 ? (
                                <p className="text-sm text-neutral-500">No categories available</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {allCategories.map(category => (
                                        <label
                                            key={category.id}
                                            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${selectedCategories.includes(category.id)
                                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                                : "bg-neutral-800 border border-neutral-700 hover:border-neutral-600"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => toggleCategory(category.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCategories.includes(category.id)
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "border-neutral-600"
                                                }`}>
                                                {selectedCategories.includes(category.id) && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-neutral-200">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Variants (for variable products) - Premium Design */}
                    {productType === "variable" && (
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Layers className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">المتغيرات</h3>
                                        <p className="text-sm text-neutral-400">{variants.length} متغير</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-all hover:scale-105"
                                >
                                    <Plus className="h-4 w-4" />
                                    إضافة متغير
                                </button>
                            </div>

                            {/* Stats Bar */}
                            <div className="px-5 py-3 bg-neutral-800/30 border-b border-neutral-800 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-emerald-400" />
                                    <span className="text-neutral-400">إجمالي المخزون:</span>
                                    <span className="text-emerald-400 font-semibold">
                                        {variants.reduce((sum, v) => sum + (parseInt(String(v.stock)) || 0), 0)} قطعة
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-amber-400" />
                                    <span className="text-neutral-400">نطاق السعر:</span>
                                    <span className="text-amber-400 font-semibold">
                                        {variants.length > 0 ? (
                                            <>
                                                {formatPrice(Math.min(...variants.map(v => parseFloat(v.price) || 0)))} - {formatPrice(Math.max(...variants.map(v => parseFloat(v.price) || 0)))}
                                            </>
                                        ) : formatPrice(0)}
                                    </span>
                                </div>
                            </div>

                            {/* Variants List */}
                            {variants.length > 0 ? (
                                <div className="divide-y divide-neutral-800">
                                    {variants.map((variant, index) => (
                                        <div key={variant.id} className="p-5 hover:bg-neutral-800/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox + 3 Editable Images */}
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-emerald-500 focus:ring-emerald-500/50"
                                                    />
                                                    <div className="flex gap-2">
                                                        {[0, 1, 2].map((imgIndex) => {
                                                            const images = variant.images || [];
                                                            const currentImage = images[imgIndex];
                                                            const isMainImage = imgIndex === 0;

                                                            // Debug: Log image data on first render
                                                            if (imgIndex === 0) {
                                                                console.log(`🖼️ Variant ${variant.id} images:`, images, 'type:', typeof images);
                                                            }

                                                            return (
                                                                <div key={imgIndex} className="relative group">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        id={`variant-image-${variant.id}-${imgIndex}`}
                                                                        className="hidden"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                // Capture current index in closure
                                                                                const variantIndex = index;
                                                                                const imageSlotIndex = imgIndex;

                                                                                // Show loading state
                                                                                setVariants(prev => {
                                                                                    const updated = [...prev];
                                                                                    const newImages = [...(updated[variantIndex].images || [])];
                                                                                    while (newImages.length <= imageSlotIndex) {
                                                                                        newImages.push('');
                                                                                    }
                                                                                    newImages[imageSlotIndex] = 'uploading...';
                                                                                    updated[variantIndex] = { ...updated[variantIndex], images: newImages };
                                                                                    return updated;
                                                                                });

                                                                                // Upload to server
                                                                                const uploadedUrl = await uploadVariantImage(file);

                                                                                // Update with actual URL using callback to get fresh state
                                                                                setVariants(prev => {
                                                                                    const finalUpdated = [...prev];
                                                                                    const finalImages = [...(finalUpdated[variantIndex].images || [])];
                                                                                    while (finalImages.length <= imageSlotIndex) {
                                                                                        finalImages.push('');
                                                                                    }
                                                                                    finalImages[imageSlotIndex] = uploadedUrl || '';
                                                                                    finalUpdated[variantIndex] = {
                                                                                        ...finalUpdated[variantIndex],
                                                                                        images: finalImages.filter(img => img && img !== 'uploading...'),
                                                                                        image_url: finalImages[0] || ''
                                                                                    };
                                                                                    return finalUpdated;
                                                                                });

                                                                                if (!uploadedUrl) {
                                                                                    console.error("❌ Image upload failed");
                                                                                } else {
                                                                                    console.log("✅ Image uploaded:", uploadedUrl);
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`variant-image-${variant.id}-${imgIndex}`}
                                                                        className={`block ${isMainImage ? 'w-16 h-16' : 'w-12 h-12'} bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-xl overflow-hidden flex-shrink-0 shadow-lg cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all relative`}
                                                                    >
                                                                        {currentImage === 'uploading...' ? (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Upload className={`${isMainImage ? 'h-6 w-6' : 'h-4 w-4'} text-emerald-400 animate-pulse`} />
                                                                            </div>
                                                                        ) : currentImage && currentImage.startsWith('http') ? (
                                                                            <img
                                                                                src={currentImage}
                                                                                alt={`${variant.name || 'متغير'} - صورة ${imgIndex + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    console.log("❌ Image load error for:", currentImage);
                                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <ImageIcon className={`${isMainImage ? 'h-6 w-6' : 'h-4 w-4'} text-neutral-500`} />
                                                                            </div>
                                                                        )}
                                                                        {/* Hover overlay */}
                                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                                                            <Plus className={`${isMainImage ? 'h-5 w-5' : 'h-4 w-4'} text-white`} />
                                                                        </div>
                                                                    </label>
                                                                    {isMainImage && (
                                                                        <span className="absolute -bottom-1 -right-1 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                                                                            رئيسية
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Variant Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-white text-lg">
                                                            {variant.name || `متغير ${index + 1}`}
                                                        </h4>
                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${variant.status === "active"
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-neutral-700 text-neutral-400"
                                                            }`}>
                                                            {variant.status === "active" ? "نشط" : "مخفي"}
                                                        </span>
                                                    </div>

                                                    {/* Editable Fields */}
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-neutral-500 mb-1">SKU</label>
                                                            <input
                                                                type="text"
                                                                value={variant.sku || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], sku: e.target.value };
                                                                    setVariants(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                                placeholder="SKU-001"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-neutral-500 mb-1">السعر ({getCurrencySymbol()})</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.price || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], price: e.target.value };
                                                                    setVariants(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-neutral-500 mb-1">المخزون</label>
                                                            <input
                                                                type="number"
                                                                value={variant.stock || 0}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], stock: parseInt(e.target.value) || 0 };
                                                                    setVariants(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-neutral-500 mb-1">الحالة</label>
                                                            <select
                                                                value={variant.status || 'active'}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], status: e.target.value };
                                                                    setVariants(updated);
                                                                }}
                                                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                            >
                                                                <option value="active">نشط</option>
                                                                <option value="inactive">مخفي</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteVariant(variant.id, index)}
                                                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Layers className="h-8 w-8 text-neutral-600" />
                                    </div>
                                    <h4 className="text-neutral-300 font-medium mb-2">لا توجد متغيرات</h4>
                                    <p className="text-neutral-500 text-sm mb-4">أضف متغيرات مثل الحجم واللون</p>
                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة أول متغير
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image */}
                    <Section title="Product Image" icon={<ImageIcon className="h-5 w-5" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="https://..."
                                />
                            </div>
                            {imageUrl && (
                                <div className="w-32 h-32 rounded-lg overflow-hidden bg-neutral-800">
                                    <img
                                        src={getFullImageUrl(imageUrl)}
                                        alt="Product"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Shipping */}
                    <Section title="Shipping" icon={<Package className="h-5 w-5" />} defaultOpen={false}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Weight</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="0"
                                    />
                                    <select
                                        value={weightUnit}
                                        onChange={(e) => setWeightUnit(e.target.value)}
                                        className="px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Dimensions (L×W×H)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={length}
                                        onChange={(e) => setLength(e.target.value)}
                                        className="flex-1 px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
                                        placeholder="L"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value)}
                                        className="flex-1 px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
                                        placeholder="W"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="flex-1 px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
                                        placeholder="H"
                                    />
                                    <select
                                        value={dimensionUnit}
                                        onChange={(e) => setDimensionUnit(e.target.value)}
                                        className="px-2 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100"
                                    >
                                        <option value="cm">cm</option>
                                        <option value="m">m</option>
                                        <option value="in">in</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Section>
                </form>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <Trash2 className="h-6 w-6 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-100">تأكيد الحذف</h2>
                            </div>
                            <p className="text-neutral-300 mb-6">
                                هل أنت متأكد من حذف هذا المنتج؟
                                <br />
                                <span className="text-sm text-neutral-500">لا يمكن التراجع عن هذا الإجراء.</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={executeDelete}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {deleting ? "جاري الحذف..." : "نعم، احذف"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
