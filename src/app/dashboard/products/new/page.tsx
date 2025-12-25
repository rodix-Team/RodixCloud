"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { ImageUpload } from "@/components/ui/image-upload";
import { VariantBuilder } from "@/components/ui/variant-builder";
import { http } from "@/lib/http";
import { ArrowLeft, Save, Package, Layers, Sparkles, Search, Truck, BarChart3, Tag, ChevronDown, ChevronUp, Info, FolderTree } from "lucide-react";
import Link from "next/link";

type ImageItem = { id: string; url: string; isPrimary?: boolean };
type VariantOption = { name: string; values: string[] };
type Variant = {
  id: string;
  sku: string;
  price: string;
  stock: string;
  attributes: Record<string, string>;
  images: ImageItem[];
  // Shipping fields
  weight: string;
  weight_unit: string;
  length: string;
  width: string;
  height: string;
  dimension_unit: string;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"simple" | "variable">("simple");

  // Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);

  // Simple Product - Pricing
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [cost, setCost] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("0");

  // Inventory Settings
  const [trackInventory, setTrackInventory] = useState(true);
  const [continueSellingOutOfStock, setContinueSellingOutOfStock] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  // Shipping
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dimensionUnit, setDimensionUnit] = useState("cm");

  // Organization
  const [vendor, setVendor] = useState("");
  const [productType, setProductType] = useState("");
  const [tags, setTags] = useState("");

  // Categories
  const [allCategories, setAllCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");

  // Variable Product
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Product Status
  const [status, setStatus] = useState<"active" | "draft">("active");

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    shipping: false,
    seo: false,
    organization: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await http.get("/categories");
        setAllCategories(response.data.data || response.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Calculate profit margin
  const calculateMargin = () => {
    const priceNum = parseFloat(price) || 0;
    const costNum = parseFloat(cost) || 0;
    if (priceNum === 0 || costNum === 0) return null;
    const profit = priceNum - costNum;
    const margin = (profit / priceNum) * 100;
    return { profit: profit.toFixed(2), margin: margin.toFixed(1) };
  };

  // فلترة الصور - قبول URLs الصحيحة (absolute أو relative) واستبعاد Base64
  const getValidImageUrls = (imgs: ImageItem[]) => {
    return imgs
      .filter(img => img.url && !img.url.startsWith("data:"))
      .map(img => img.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validImages = getValidImageUrls(images);
      const primaryImage = images.find(img => img.isPrimary && img.url && !img.url.startsWith("data:"))?.url
        || validImages[0]
        || null;
      const gallery = validImages.filter(url => url !== primaryImage);

      if (activeTab === "simple") {
        const payload: any = {
          type: "simple",
          name,
          description: description || null,
          price: parseFloat(price),
          compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
          cost: cost ? parseFloat(cost) : null,
          sku: sku || `PRD-${Date.now()}`,
          barcode: barcode || null,
          stock: parseInt(stock) || 0,
          status,
          // Shipping
          weight: weight ? parseFloat(weight) : null,
          weight_unit: weightUnit,
          length: length ? parseFloat(length) : null,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          dimension_unit: dimensionUnit,
          // Organization
          brand: vendor || null,
          product_type: productType || null,
          tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : [],
          // SEO
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          url_handle: urlHandle || null,
          // Inventory settings
          track_inventory: trackInventory,
          continue_selling_out_of_stock: continueSellingOutOfStock,
          low_stock_threshold: trackInventory ? parseInt(lowStockThreshold) || 5 : null,
          // Categories
          categories: selectedCategories,
        };

        // فقط نضيف الصور إذا كانت URLs صحيحة
        if (primaryImage) payload.image_url = primaryImage;
        if (gallery.length > 0) payload.gallery = gallery;

        await http.post("/products", payload);
      } else {
        // Variable Product
        const validOptions = options.filter(o => o.name && o.values.some(v => v));

        if (validOptions.length === 0) {
          setError("Please add at least one option (e.g., Size, Color)");
          setLoading(false);
          return;
        }

        if (variants.length === 0) {
          setError("Please generate variants first");
          setLoading(false);
          return;
        }

        const payload: any = {
          type: "variable",
          name,
          description: description || null,
          attributes: validOptions.map(o => ({
            name: o.name.trim(),
            options: o.values.filter(v => v).map(v => v.trim()),
          })),
          variants: variants.map(v => {
            // Trim the attribute keys and values
            const trimmedAttributes: Record<string, string> = {};
            Object.entries(v.attributes).forEach(([key, value]) => {
              trimmedAttributes[key.trim()] = value.trim();
            });
            return {
              sku: v.sku,
              price: parseFloat(v.price) || 0,
              stock: parseInt(v.stock) || 0,
              attributes: trimmedAttributes,
              images: getValidImageUrls(v.images),
            };
          }),
          status,
        };

        // فقط نضيف الصور إذا كانت URLs صحيحة
        if (primaryImage) payload.image_url = primaryImage;
        if (gallery.length > 0) payload.gallery = gallery;

        await http.post("/products", payload);
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message
        || err.response?.data?.errors
        || "Failed to create product";

      if (typeof message === "object") {
        setError(Object.values(message).flat().join(", "));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Store" subtitle="New Product">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/products"
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">New Product</h1>
                <p className="text-sm text-neutral-400">Add a new product to your store</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Auto-save enabled</span>
            </div>
          </div>

          {/* Product Type Selector */}
          <div className="flex items-center gap-2 p-1 bg-neutral-800/50 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("simple")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "simple"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "text-neutral-400 hover:text-neutral-200"
                }`}
            >
              <Package className="h-4 w-4" />
              Simple Product
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("variable")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "variable"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "text-neutral-400 hover:text-neutral-200"
                }`}
            >
              <Layers className="h-4 w-4" />
              Variable Product
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <DashboardSection title="Basic Information" subtitle="Product name and description">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe your product..."
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Images */}
            <DashboardSection title="Product Images" subtitle="Upload images or add URLs">
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={6}
                showPrimarySelector={true}
                folder="products"
              />
            </DashboardSection>

            {/* Simple Product Fields */}
            {activeTab === "simple" && (
              <>
                {/* Pricing Section */}
                <DashboardSection title="Pricing" subtitle="Set product pricing and profit margins">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Compare at Price
                          <span className="ml-1 text-neutral-500 text-xs">(Original price)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                          <input
                            type="number"
                            value={compareAtPrice}
                            onChange={(e) => setCompareAtPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                        {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price || "0") && (
                          <p className="text-xs text-emerald-400 mt-1">
                            💰 {Math.round((1 - parseFloat(price || "0") / parseFloat(compareAtPrice)) * 100)}% discount
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Cost per item
                          <span className="ml-1 text-neutral-500 text-xs">(for profit calculation)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                          <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profit Margin Display */}
                    {calculateMargin() && (
                      <div className="flex items-center gap-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-neutral-300">Profit:</span>
                          <span className="text-sm font-semibold text-emerald-400">${calculateMargin()?.profit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-300">Margin:</span>
                          <span className="text-sm font-semibold text-emerald-400">{calculateMargin()?.margin}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </DashboardSection>

                {/* Inventory Section */}
                <DashboardSection title="Inventory" subtitle="Stock management and tracking">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          SKU <span className="text-neutral-500">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Auto-generated"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Barcode (ISBN, UPC, GTIN)
                        </label>
                        <input
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          placeholder="Enter barcode"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
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
                          placeholder="0"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Inventory Settings */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={trackInventory}
                          onChange={(e) => setTrackInventory(e.target.checked)}
                          className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        <span className="text-sm text-neutral-300">Track quantity</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={continueSellingOutOfStock}
                          onChange={(e) => setContinueSellingOutOfStock(e.target.checked)}
                          className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        <span className="text-sm text-neutral-300">Continue selling when out of stock</span>
                      </label>
                    </div>

                    {trackInventory && (
                      <div className="max-w-xs">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Low stock alert threshold
                        </label>
                        <input
                          type="number"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          min="0"
                          placeholder="5"
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    )}
                  </div>
                </DashboardSection>
              </>
            )}

            {/* Variable Product Fields */}
            {activeTab === "variable" && (
              <DashboardSection
                title="Product Variants"
                subtitle="Add options like size, color, and create variants"
              >
                <VariantBuilder
                  options={options}
                  variants={variants}
                  onOptionsChange={setOptions}
                  onVariantsChange={setVariants}
                />
              </DashboardSection>
            )}

            {/* Shipping Section - Collapsible */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("shipping")}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-neutral-400" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-neutral-200">Shipping</h3>
                    <p className="text-xs text-neutral-500">Weight, dimensions & shipping info</p>
                  </div>
                </div>
                {expandedSections.shipping ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
              </button>

              {expandedSections.shipping && (
                <div className="p-4 space-y-4 border-t border-neutral-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPhysicalProduct}
                      onChange={(e) => setIsPhysicalProduct(e.target.checked)}
                      className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-neutral-300">This is a physical product</span>
                  </label>

                  {isPhysicalProduct && (
                    <>
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
                              placeholder="0.0"
                              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Dimensions <span className="text-neutral-500">(optional)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            min="0"
                            step="0.1"
                            placeholder="Length"
                            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                          />
                          <span className="text-neutral-500">×</span>
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            min="0"
                            step="0.1"
                            placeholder="Width"
                            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                          />
                          <span className="text-neutral-500">×</span>
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            min="0"
                            step="0.1"
                            placeholder="Height"
                            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                          />
                          <select
                            value={dimensionUnit}
                            onChange={(e) => setDimensionUnit(e.target.value)}
                            className="px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="in">in</option>
                            <option value="ft">ft</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Organization Section - Collapsible */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("organization")}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-neutral-400" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-neutral-200">Organization</h3>
                    <p className="text-xs text-neutral-500">Categories, tags & vendor</p>
                  </div>
                </div>
                {expandedSections.organization ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
              </button>

              {expandedSections.organization && (
                <div className="p-4 space-y-4 border-t border-neutral-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Product Type
                      </label>
                      <input
                        type="text"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        placeholder="e.g., T-Shirt, Electronics"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Vendor / Brand
                      </label>
                      <input
                        type="text"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        placeholder="e.g., Nike, Apple"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Tags
                      <span className="ml-1 text-neutral-500 text-xs">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="summer, sale, new-arrival"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>

                  {/* Categories Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-emerald-400" />
                        Categories
                      </div>
                    </label>
                    {allCategories.length === 0 ? (
                      <p className="text-sm text-neutral-500">No categories available. <a href="/dashboard/categories" className="text-emerald-400 hover:underline">Create categories</a></p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-neutral-800/50 rounded-xl border border-neutral-700">
                        {allCategories.map(category => (
                          <label
                            key={category.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedCategories.includes(category.id)
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
                            <span className="text-xs text-neutral-200">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {selectedCategories.length > 0 && (
                      <p className="text-xs text-emerald-400 mt-1">{selectedCategories.length} categories selected</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SEO Section - Collapsible */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("seo")}
                className="w-full flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-neutral-400" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-neutral-200">Search Engine Listing</h3>
                    <p className="text-xs text-neutral-500">SEO title, description & URL</p>
                  </div>
                </div>
                {expandedSections.seo ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
              </button>

              {expandedSections.seo && (
                <div className="p-4 space-y-4 border-t border-neutral-800">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Page Title
                      <span className="ml-1 text-neutral-500 text-xs">(max 70 characters)</span>
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      maxLength={70}
                      placeholder={name || "Product title"}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <p className="text-xs text-neutral-500 mt-1">{seoTitle.length}/70 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Meta Description
                      <span className="ml-1 text-neutral-500 text-xs">(max 160 characters)</span>
                    </label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      maxLength={160}
                      rows={2}
                      placeholder="Brief description for search engines..."
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    />
                    <p className="text-xs text-neutral-500 mt-1">{seoDescription.length}/160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      URL Handle
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500">yourstore.com/products/</span>
                      <input
                        type="text"
                        value={urlHandle}
                        onChange={(e) => setUrlHandle(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        placeholder={name?.toLowerCase().replace(/\s+/g, "-") || "product-url"}
                        className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* SEO Preview */}
                  <div className="p-4 bg-neutral-800/50 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-2">Search Engine Preview</p>
                    <p className="text-blue-400 text-sm font-medium truncate">
                      {seoTitle || name || "Product Title"}
                    </p>
                    <p className="text-emerald-500 text-xs truncate">
                      yourstore.com/products/{urlHandle || name?.toLowerCase().replace(/\s+/g, "-") || "product-url"}
                    </p>
                    <p className="text-neutral-400 text-xs mt-1 line-clamp-2">
                      {seoDescription || description || "Product description will appear here..."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Status */}
            <DashboardSection title="Product Status" subtitle="Set visibility of your product">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${status === "active"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700"
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-white" : "bg-emerald-400"}`} />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${status === "draft"
                    ? "bg-neutral-600 text-white shadow-lg"
                    : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700"
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${status === "draft" ? "bg-white" : "bg-neutral-500"}`} />
                  Draft
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-3">
                {status === "active"
                  ? "✓ This product will be visible to customers"
                  : "⚠ This product will be hidden from customers"
                }
              </p>
            </DashboardSection>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500">
                * Required fields
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/products"
                  className="px-5 py-2.5 border border-neutral-700 rounded-xl text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !name || (activeTab === "simple" && !price)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
