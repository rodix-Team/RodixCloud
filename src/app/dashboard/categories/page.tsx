"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import {
    Tag, Plus, Edit2, Trash2, Loader2, Search,
    FolderTree, Save, X, MoreVertical, Package, Image as ImageIcon, Upload, Link
} from "lucide-react";

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null;
    banner_url?: string;
    thumbnail_url?: string;
    products_count?: number;
    created_at?: string;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        parent_id: "",
        banner_url: "",
        thumbnail_url: ""
    });

    // Delete confirmation
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Image upload states
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    // Upload image to server (with Base64 fallback)
    const uploadImage = async (file: File, type: 'banner' | 'thumbnail') => {
        const setUploading = type === 'banner' ? setUploadingBanner : setUploadingThumbnail;
        const fieldName = type === 'banner' ? 'banner_url' : 'thumbnail_url';

        // First show local preview immediately
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setFormData(prev => ({ ...prev, [fieldName]: base64 }));
        };
        reader.readAsDataURL(file);

        // Then try to upload to server
        try {
            setUploading(true);
            setError('');

            const formDataUpload = new FormData();
            formDataUpload.append('images[]', file);
            formDataUpload.append('folder', 'categories');

            const response = await http.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('📸 Upload response:', response.data);
            const uploadedUrl = getFullImageUrl(response.data.data[0].url);
            console.log('📸 Full URL:', uploadedUrl);
            // Replace Base64 with server URL
            setFormData(prev => ({ ...prev, [fieldName]: uploadedUrl }));
            setSuccess(`${type === 'banner' ? 'Banner' : 'Thumbnail'} uploaded successfully!`);
            setTimeout(() => setSuccess(''), 2000);
        } catch (err: any) {
            console.warn('Server upload failed, using local preview:', err);
            // Keep the Base64 preview - already set above
            // Don't show error to user since local preview works
        } finally {
            setUploading(false);
        }
    };
    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await http.get("/categories");
            console.log("📂 Categories from API:", response.data);
            setCategories(response.data.data || response.data || []);
        } catch (err: any) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Debounced search for performance (300ms delay)
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Memoized filtered categories for performance
    const filteredCategories = useMemo(() =>
        categories.filter(cat =>
            cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            cat.slug?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        ), [categories, debouncedSearchQuery]);

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", slug: "", description: "", parent_id: "", banner_url: "", thumbnail_url: "" });
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug || "",
            description: category.description || "",
            parent_id: category.parent_id?.toString() || "",
            banner_url: category.banner_url || "",
            thumbnail_url: category.thumbnail_url || ""
        });
        setShowModal(true);
    };

    // Generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // Handle name change (auto-generate slug)
    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            // Auto-generate slug from name (always update while typing)
            slug: generateSlug(name)
        }));
    };

    // Save category
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Category name is required");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const data = {
                name: formData.name.trim(),
                slug: formData.slug.trim() || generateSlug(formData.name),
                description: formData.description.trim(),
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                banner_url: formData.banner_url.trim() || null,
                thumbnail_url: formData.thumbnail_url.trim() || null
            };

            if (editingCategory) {
                await http.put(`/categories/${editingCategory.id}`, data);
                setSuccess("Category updated successfully!");
            } else {
                await http.post("/categories", data);
                setSuccess("Category created successfully!");
            }

            setShowModal(false);
            fetchCategories();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to save category:", err);
            setError(err.response?.data?.message || "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            await http.delete(`/categories/${deleteId}`);
            setSuccess("Category deleted successfully!");
            setDeleteId(null);
            fetchCategories();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            console.error("Failed to delete category:", err);
            setError(err.response?.data?.message || "Failed to delete category");
        } finally {
            setDeleting(false);
        }
    };

    // Get parent category name
    const getParentName = (parentId: number | null) => {
        if (!parentId) return null;
        const parent = categories.find(c => c.id === parentId);
        return parent?.name || null;
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Store" subtitle="Categories">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-100">Categories</h1>
                                <p className="text-sm text-neutral-400">Organize your products into categories</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                                <FolderTree className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">{categories.length} categories</span>
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
                            {error}
                            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    {/* Categories List */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderTree className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
                                <p className="text-neutral-400">No categories found</p>
                                <button
                                    onClick={openAddModal}
                                    className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
                                >
                                    Create your first category
                                </button>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Category</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Slug</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Parent</th>
                                        <th className="text-left py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Products</th>
                                        <th className="text-right py-4 px-6 text-xs font-medium text-neutral-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {category.thumbnail_url ? (
                                                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                                                            <img
                                                                src={category.thumbnail_url}
                                                                alt={category.name}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-full w-full bg-emerald-500/10 flex items-center justify-center"><svg class="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg></div>';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-neutral-700/50">
                                                            <Tag className="h-5 w-5 text-emerald-400" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-neutral-200">{category.name}</p>
                                                        {category.description && (
                                                            <p className="text-xs text-neutral-500 truncate max-w-xs">{category.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-neutral-400 font-mono">{category.slug || "-"}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getParentName(category.parent_id) ? (
                                                    <span className="text-sm text-neutral-400">{getParentName(category.parent_id)}</span>
                                                ) : (
                                                    <span className="text-xs text-neutral-600">None</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-neutral-500" />
                                                    <span className="text-sm text-neutral-400">{category.products_count || 0}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(category.id)}
                                                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-neutral-900 flex items-center justify-between p-5 border-b border-neutral-800 z-10">
                                <h2 className="text-lg font-semibold text-neutral-100">
                                    {editingCategory ? "Edit Category" : "Add Category"}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-5">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Basic Information</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Category Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                                placeholder="e.g. Electronics, Clothing"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                                placeholder="electronics"
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">URL-friendly name (auto-generated)</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Parent Category
                                            </label>
                                            <select
                                                value={formData.parent_id}
                                                onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            >
                                                <option value="">None (Top Level)</option>
                                                {categories
                                                    .filter(c => c.id !== editingCategory?.id)
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                rows={3}
                                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                                placeholder="Category description..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column - Images */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Category Images</h3>

                                        {/* Banner Image */}
                                        <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-700">
                                            <label className="block text-sm font-medium text-neutral-300 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-blue-400" />
                                                    Banner Image
                                                    <span className="text-xs text-neutral-500">(1200x400px)</span>
                                                </div>
                                            </label>

                                            {/* Toggle Buttons */}
                                            <div className="flex gap-2 mb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, bannerInputMode: 'url' }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(formData as any).bannerInputMode !== 'upload'
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                                        }`}
                                                >
                                                    <Link className="h-3 w-3" />
                                                    URL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, bannerInputMode: 'upload' }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(formData as any).bannerInputMode === 'upload'
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                                        }`}
                                                >
                                                    <Upload className="h-3 w-3" />
                                                    Upload
                                                </button>
                                            </div>

                                            {(formData as any).bannerInputMode === 'upload' ? (
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${uploadingBanner ? 'border-blue-500/50 bg-blue-500/5' : 'border-neutral-600 hover:border-blue-500/50 cursor-pointer'}`}
                                                    onClick={() => !uploadingBanner && document.getElementById('banner-upload')?.click()}
                                                >
                                                    <input
                                                        id="banner-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingBanner}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                uploadImage(file, 'banner');
                                                            }
                                                        }}
                                                    />
                                                    {uploadingBanner ? (
                                                        <>
                                                            <Loader2 className="h-6 w-6 text-blue-400 mx-auto mb-2 animate-spin" />
                                                            <p className="text-xs text-blue-400">Uploading banner...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                                                            <p className="text-xs text-neutral-400">Click to upload banner</p>
                                                            <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 5MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={formData.banner_url}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    placeholder="https://example.com/banner.jpg"
                                                />
                                            )}

                                            {formData.banner_url && (
                                                <div className="mt-3 relative group">
                                                    <img
                                                        src={formData.banner_url}
                                                        alt="Banner preview"
                                                        loading="lazy"
                                                        className="w-full h-24 rounded-lg border border-neutral-700 object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                                                        className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3 text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Thumbnail Image */}
                                        <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-700">
                                            <label className="block text-sm font-medium text-neutral-300 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                                                    Thumbnail Image
                                                    <span className="text-xs text-neutral-500">(300x300px)</span>
                                                </div>
                                            </label>

                                            {/* Toggle Buttons */}
                                            <div className="flex gap-2 mb-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbnailInputMode: 'url' }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(formData as any).thumbnailInputMode !== 'upload'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                                        }`}
                                                >
                                                    <Link className="h-3 w-3" />
                                                    URL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbnailInputMode: 'upload' }))}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(formData as any).thumbnailInputMode === 'upload'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                                                        }`}
                                                >
                                                    <Upload className="h-3 w-3" />
                                                    Upload
                                                </button>
                                            </div>

                                            {(formData as any).thumbnailInputMode === 'upload' ? (
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${uploadingThumbnail ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-600 hover:border-emerald-500/50 cursor-pointer'}`}
                                                    onClick={() => !uploadingThumbnail && document.getElementById('thumbnail-upload')?.click()}
                                                >
                                                    <input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingThumbnail}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                uploadImage(file, 'thumbnail');
                                                            }
                                                        }}
                                                    />
                                                    {uploadingThumbnail ? (
                                                        <>
                                                            <Loader2 className="h-6 w-6 text-emerald-400 mx-auto mb-2 animate-spin" />
                                                            <p className="text-xs text-emerald-400">Uploading thumbnail...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-6 w-6 text-neutral-500 mx-auto mb-2" />
                                                            <p className="text-xs text-neutral-400">Click to upload thumbnail</p>
                                                            <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 2MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={formData.thumbnail_url}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                                    placeholder="https://example.com/thumbnail.jpg"
                                                />
                                            )}

                                            {formData.thumbnail_url && (
                                                <div className="mt-3 relative group inline-block">
                                                    <img
                                                        src={formData.thumbnail_url}
                                                        alt="Thumbnail preview"
                                                        loading="lazy"
                                                        className="h-20 w-20 rounded-lg border border-neutral-700 object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                                        className="absolute -top-1 -right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3 text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {editingCategory ? "Update Category" : "Create Category"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md mx-4 p-6">
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                    <Trash2 className="h-6 w-6 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-100 mb-2">Delete Category?</h3>
                                <p className="text-sm text-neutral-400 mb-6">
                                    Are you sure you want to delete this category? Products in this category will not be deleted but will become uncategorized.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => setDeleteId(null)}
                                        className="px-4 py-2.5 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {deleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
