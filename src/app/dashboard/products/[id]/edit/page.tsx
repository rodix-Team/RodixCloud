"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import {
    ArrowLeft, Save, Package, Loader2, Trash2,
    ChevronDown, ChevronUp, Image as ImageIcon, Tag, Layers
} from "lucide-react";
import Link from "next/link";

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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
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

            const productData = {
                name: name.trim(),
                sku: sku.trim(),
                description: description.trim(),
                short_description: shortDescription.trim(),
                regular_price: regularPrice,
                sale_price: salePrice,
                stock: parseInt(stock) || 0,
                status,
                image_url: imageUrl,
                weight,
                weight_unit: weightUnit,
                length,
                width,
                height,
                dimension_unit: dimensionUnit,
                categories: selectedCategories,
            };

            await http.put(`/products/${productId}`, productData);
            setSuccess("Product updated successfully!");

            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to update product:", err);
            setError(err.response?.data?.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            setDeleting(true);
            await http.delete(`/products/${productId}`);
            router.push("/dashboard/products");
        } catch (err: any) {
            console.error("Failed to delete product:", err);
            setError(err.response?.data?.message || "Failed to delete product");
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

                            <div className="grid grid-cols-2 gap-4">
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

                    {/* Pricing */}
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

                    {/* Inventory */}
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

                    {/* Variants (for variable products) */}
                    {productType === "variable" && variants.length > 0 && (
                        <Section title={`Variants (${variants.length})`} icon={<Layers className="h-5 w-5" />}>
                            <div className="space-y-4">
                                <p className="text-sm text-neutral-400">Manage product variants:</p>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-700">
                                                <th className="text-left py-2 px-3 text-neutral-400 font-medium">Variant</th>
                                                <th className="text-left py-2 px-3 text-neutral-400 font-medium">SKU</th>
                                                <th className="text-left py-2 px-3 text-neutral-400 font-medium">Price</th>
                                                <th className="text-left py-2 px-3 text-neutral-400 font-medium">Stock</th>
                                                <th className="text-left py-2 px-3 text-neutral-400 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((variant, index) => (
                                                <tr key={variant.id} className="border-b border-neutral-800 hover:bg-neutral-800/30">
                                                    <td className="py-3 px-3">
                                                        <div>
                                                            <p className="text-neutral-200 font-medium">{variant.name || `Variant ${index + 1}`}</p>
                                                            {variant.options && (
                                                                <p className="text-xs text-neutral-500">
                                                                    {Object.entries(variant.options).map(([key, value]) => `${key}: ${value}`).join(", ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => {
                                                                const updated = [...variants];
                                                                updated[index] = { ...updated[index], sku: e.target.value };
                                                                setVariants(updated);
                                                            }}
                                                            className="w-24 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.price}
                                                            onChange={(e) => {
                                                                const updated = [...variants];
                                                                updated[index] = { ...updated[index], price: e.target.value };
                                                                setVariants(updated);
                                                            }}
                                                            className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => {
                                                                const updated = [...variants];
                                                                updated[index] = { ...updated[index], stock: parseInt(e.target.value) || 0 };
                                                                setVariants(updated);
                                                            }}
                                                            className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            variant.status === "active" 
                                                                ? "bg-emerald-500/20 text-emerald-400"
                                                                : "bg-neutral-700 text-neutral-400"
                                                        }`}>
                                                            {variant.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Section>
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
            </DashboardLayout>
        </ProtectedRoute>
    );
}
