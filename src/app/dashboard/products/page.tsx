"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import { http, getFullImageUrl } from "@/lib/http";
import { useUndoRedo, ProductChange } from "@/hooks/useUndoRedo";
import { useToast } from "@/components/ui/Toast";
import { QuickEditModal } from "@/components/ui/quick-edit-modal";
import {
  Package, Plus, Edit, Trash2, Search, Filter,
  Check, X, ChevronDown, ChevronLeft, ChevronRight, Percent, DollarSign,
  CheckSquare, Square, Minus, Boxes, Keyboard,
  Undo2, Redo2, Save, Loader2, Eye, EyeOff,
  ArrowUp, ArrowDown, SlidersHorizontal, Tag,
  AlertTriangle, PackageX, TrendingUp, TrendingDown, Zap,
  FileSpreadsheet
} from "lucide-react";

type ProductVariant = {
  id: number;
  sku: string;
  price: string;
  stock: number;
  options: Record<string, string>;
  images: string[];
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
  created_at: string;
  // Shipping
  weight: number | null;
  weight_unit: string | null;
  // Organization
  brand: string | null;
  product_type: string | null;
  tags: string[] | null;
  variants?: ProductVariant[];
};

// Helper functions for variable products
const getVariantPriceRange = (variants?: ProductVariant[]): string => {
  if (!variants || variants.length === 0) return "$0";
  const prices = variants.map(v => parseFloat(v.price) || 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
};

const getVariantTotalStock = (variants?: ProductVariant[]): number => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
};

type ProductsResponse = {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
};

// Cell position type for navigation
type CellPosition = {
  rowIndex: number;
  colIndex: number;
};

// Available columns configuration - ALL visible by default for best client experience
const COLUMNS = [
  { id: "image", label: "Image", default: true, alwaysVisible: true },
  { id: "name", label: "Name", default: true, alwaysVisible: true },
  { id: "sku", label: "SKU", default: true },
  { id: "barcode", label: "Barcode", default: true },
  { id: "price", label: "Price", default: true, editable: true },
  { id: "compare_price", label: "Compare Price", default: true },
  { id: "cost", label: "Cost", default: true },
  { id: "stock", label: "Stock", default: true, editable: true },
  { id: "weight", label: "Weight", default: true },
  { id: "brand", label: "Brand", default: true },
  { id: "product_type", label: "Category", default: true },
  { id: "tags", label: "Tags", default: true },
  { id: "status", label: "Status", default: true },
  { id: "type", label: "Type", default: true },
  { id: "created", label: "Created", default: true },
];

// Column config version - increment to reset user preferences
const COLUMNS_VERSION = 3;

// Editable cell component with navigation support
const EditableCell = ({
  value,
  onSave,
  type = "text",
  prefix = "",
  className = "",
  cellId,
  isActive,
  onActivate,
  onNavigate,
  isSaving = false,
  justSaved = false,
}: {
  value: string | number;
  onSave: (val: string) => void;
  type?: "text" | "number";
  prefix?: string;
  className?: string;
  cellId: string;
  isActive: boolean;
  onActivate: () => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
  isSaving?: boolean;
  justSaved?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== String(value)) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
      onNavigate("down");
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleSave();
      onNavigate(e.shiftKey ? "left" : "right");
    } else if (e.key === "ArrowUp" && !isEditing) {
      e.preventDefault();
      onNavigate("up");
    } else if (e.key === "ArrowDown" && !isEditing) {
      e.preventDefault();
      onNavigate("down");
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      onNavigate(e.shiftKey ? "left" : "right");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onNavigate("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onNavigate("down");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNavigate("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNavigate("right");
    } else if (/^[0-9.]$/.test(e.key)) {
      setEditValue(e.key);
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        {prefix && <span className="text-neutral-500 text-sm">{prefix}</span>}
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-20 px-2 py-1 bg-neutral-700 border border-emerald-500 rounded text-sm text-neutral-200 focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      data-cell-id={cellId}
      onClick={() => {
        onActivate();
        setIsEditing(true);
      }}
      onFocus={onActivate}
      onKeyDown={handleCellKeyDown}
      className={`
        cursor-pointer px-2 py-1 rounded transition-all duration-200 outline-none
        ${isActive ? "ring-2 ring-emerald-500 bg-emerald-500/10" : "hover:bg-neutral-700/50"}
        ${justSaved ? "animate-pulse bg-emerald-500/20" : ""}
        ${isSaving ? "opacity-50" : ""}
        ${className}
      `}
      title="Click to edit • Tab to navigate • Enter to save"
    >
      {isSaving && <Loader2 className="inline-block h-3 w-3 mr-1 animate-spin" />}
      {prefix}{value}
    </div>
  );
};

// Keyboard shortcuts help modal
const KeyboardShortcutsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["Ctrl", "Z"], description: "Undo last change" },
    { keys: ["Ctrl", "Shift", "Z"], description: "Redo change" },
    { keys: ["Tab"], description: "Move to next cell" },
    { keys: ["Shift", "Tab"], description: "Move to previous cell" },
    { keys: ["↑", "↓"], description: "Move between rows" },
    { keys: ["←", "→"], description: "Move between columns" },
    { keys: ["Enter"], description: "Edit cell / Save & move down" },
    { keys: ["Escape"], description: "Cancel editing" },
    { keys: ["F2"], description: "Edit current cell" },
    { keys: ["?"], description: "Show this help" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Keyboard className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-100">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-lg transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
              <span className="text-sm text-neutral-400">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 font-mono">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && <span className="mx-1 text-neutral-600">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 text-center">
            Pro tip: Click any price or stock cell to edit it directly
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Bulk edit state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionDropdown, setBulkActionDropdown] = useState<string | null>(null);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState({ type: "fixed", value: "" });
  const [stockAdjustment, setStockAdjustment] = useState({ type: "fixed", value: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);

  // Navigation state
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Column visibility - with version check to reset old preferences
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const savedVersion = localStorage.getItem("productColumnsVersion");
      const saved = localStorage.getItem("productColumns");

      // If version matches and we have saved data, use it
      if (savedVersion === String(COLUMNS_VERSION) && saved) {
        return new Set(JSON.parse(saved));
      }

      // Otherwise, reset to defaults (all columns visible)
      localStorage.setItem("productColumnsVersion", String(COLUMNS_VERSION));
    }
    return new Set(COLUMNS.map(c => c.id)); // ALL columns visible by default
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Quick Edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Undo/Redo
  const { addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo<ProductChange>(20);
  const { showToast, ToastContainer } = useToast();

  // Save column preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productColumns", JSON.stringify(Array.from(visibleColumns)));
      localStorage.setItem("productColumnsVersion", String(COLUMNS_VERSION));
    }
  }, [visibleColumns]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts modal
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Undo/Redo is handled by useUndoRedo hook
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await http.get<ProductsResponse>(`/products?page=${page}`);
      setProducts(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedIds.size > 0);
  }, [selectedIds]);

  // Open single delete confirmation modal
  const handleDelete = (id: number) => {
    console.log("🗑️ Opening single delete modal for product:", id);
    setSingleDeleteId(id);
  };

  // Execute single delete
  const executeSingleDelete = async () => {
    if (!singleDeleteId) return;
    console.log("🗑️ Executing single delete for product:", singleDeleteId);
    try {
      await http.delete(`/products/${singleDeleteId}`);
      fetchProducts(currentPage);
      showToast("تم حذف المنتج بنجاح", "success");
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      showToast(`فشل في الحذف: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setSingleDeleteId(null);
    }
  };

  // Selection handlers
  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const currentPageIds = new Set(filteredProducts.map(p => p.id));
    const allCurrentSelected = filteredProducts.every(p => selectedIds.has(p.id));

    if (allCurrentSelected) {
      // Deselect only current page products, keep others
      const newSet = new Set(selectedIds);
      currentPageIds.forEach(id => newSet.delete(id));
      setSelectedIds(newSet);
    } else {
      // Add current page products to existing selection
      const newSet = new Set(selectedIds);
      currentPageIds.forEach(id => newSet.add(id));
      setSelectedIds(newSet);
    }
  };

  // Select ALL products in the entire store
  const selectAllInStore = async () => {
    try {
      setSelectingAll(true);
      setShowSelectionMenu(false);

      // Fetch all product IDs from ALL pages
      let allIds: number[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await http.get<ProductsResponse>("/products", {
          params: { per_page: 100, page: currentPage }
        });

        const pageProducts = response.data.data || [];
        const pageIds = pageProducts.map((p: Product) => p.id);
        allIds = [...allIds, ...pageIds];

        // Check if there are more pages
        const lastPage = response.data.last_page || 1;
        hasMorePages = currentPage < lastPage;
        currentPage++;

        // Safety limit to prevent infinite loops
        if (currentPage > 100) break;
      }

      setSelectedIds(new Set(allIds));
      showToast(`${allIds.length} products selected`, "success");
    } catch (error) {
      console.error("Failed to select all products:", error);
      showToast("Failed to select all products", "error");
    } finally {
      setSelectingAll(false);
    }
  };

  // Unselect all
  const unselectAll = () => {
    setSelectedIds(new Set());
    setShowSelectionMenu(false);
  };

  // Inline update handler with undo support
  const handleInlineUpdate = async (id: number, field: string, value: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const oldValue = field === "price" ? product.price : field === "stock" ? product.stock : product.status;
    const cellId = `${id}-${field}`;

    // Add to undo history
    addToHistory({
      productId: id,
      field,
      oldValue: oldValue as string | number,
      newValue: field === "price" ? parseFloat(value) : field === "stock" ? parseInt(value) : value,
    }, `Changed ${field} of ${product.name}`);

    // Show saving state
    setSavingCells(prev => new Set(prev).add(cellId));

    try {
      await http.put(`/products/${id}`, { [field]: field === "price" ? parseFloat(value) : field === "stock" ? parseInt(value) : value });

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      ));

      // Show saved feedback
      setSavingCells(prev => {
        const next = new Set(prev);
        next.delete(cellId);
        return next;
      });
      setSavedCells(prev => new Set(prev).add(cellId));
      setTimeout(() => {
        setSavedCells(prev => {
          const next = new Set(prev);
          next.delete(cellId);
          return next;
        });
      }, 1000);

      // Show toast with undo option
      showToast(`${field} updated`, "undo", () => {
        handleUndoChange({ productId: id, field, oldValue: oldValue as string | number, newValue: value });
      });
    } catch (error) {
      console.error("Failed to update:", error);
      showToast("Failed to save", "error");
      setSavingCells(prev => {
        const next = new Set(prev);
        next.delete(cellId);
        return next;
      });
    }
  };

  // Undo a specific change
  const handleUndoChange = async (change: ProductChange) => {
    try {
      await http.put(`/products/${change.productId}`, { [change.field]: change.oldValue });
      setProducts(prev => prev.map(p =>
        p.id === change.productId ? { ...p, [change.field]: change.oldValue } : p
      ));
      showToast("Change undone", "success");
    } catch (error) {
      console.error("Failed to undo:", error);
      showToast("Failed to undo", "error");
    }
  };

  // Filtered products (moved before handleNavigate to avoid hoisting issues)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search filter
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      // Stock filter
      let matchesStock = true;
      const stock = p.type === "variable" ? getVariantTotalStock(p.variants) : p.stock;
      if (stockFilter === "in_stock") matchesStock = stock > 10;
      else if (stockFilter === "low_stock") matchesStock = stock > 0 && stock <= 10;
      else if (stockFilter === "out_of_stock") matchesStock = stock === 0;

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [products, search, statusFilter, stockFilter]);

  // Navigation between cells
  const handleNavigate = useCallback((rowIndex: number, colIndex: number, direction: "up" | "down" | "left" | "right") => {
    const editableColumns = COLUMNS.filter(c => c.editable && visibleColumns.has(c.id));
    let newRow = rowIndex;
    let newCol = colIndex;

    if (direction === "up") newRow = Math.max(0, rowIndex - 1);
    else if (direction === "down") newRow = Math.min(filteredProducts.length - 1, rowIndex + 1);
    else if (direction === "left") newCol = Math.max(0, colIndex - 1);
    else if (direction === "right") newCol = Math.min(editableColumns.length - 1, colIndex + 1);

    setActiveCell({ rowIndex: newRow, colIndex: newCol });

    // Focus the cell
    const cellId = `${filteredProducts[newRow]?.id}-${editableColumns[newCol]?.id}`;
    setTimeout(() => {
      const cell = document.querySelector(`[data-cell-id="${cellId}"]`) as HTMLElement;
      cell?.focus();
    }, 0);
  }, [filteredProducts, visibleColumns]);

  // Bulk actions
  const handleBulkStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          http.put(`/products/${id}`, { status: newStatus })
        )
      );
      fetchProducts(currentPage);
      setSelectedIds(new Set());
      showToast(`${selectedIds.size} products updated`, "success");
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast("Failed to update", "error");
    } finally {
      setSaving(false);
      setBulkActionDropdown(null);
    }
  };

  // Actually perform the delete (called from modal)
  const executeDelete = async () => {
    console.log("🗑️ Executing delete for IDs:", Array.from(selectedIds));
    setShowDeleteConfirm(false);
    setSaving(true);
    try {
      console.log("🗑️ Sending delete requests...");
      const deletePromises = Array.from(selectedIds).map(id => {
        console.log(`🗑️ Deleting product ${id}...`);
        return http.delete(`/products/${id}`);
      });

      await Promise.all(deletePromises);
      console.log("🗑️ All products deleted successfully!");
      await fetchProducts(currentPage);
      setSelectedIds(new Set());
      showToast(`تم حذف المنتجات بنجاح`, "success");
    } catch (error: any) {
      console.error("❌ Failed to delete:", error);
      console.error("❌ Error details:", error.response?.data);
      showToast(`فشل في الحذف: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation modal
  const handleBulkDelete = () => {
    console.log("🗑️ Opening delete confirmation modal");
    setShowDeleteConfirm(true);
  };

  const handleBulkPriceAdjust = async () => {
    if (!priceAdjustment.value) return;
    setSaving(true);
    try {
      const selectedProducts = products.filter(p => selectedIds.has(p.id) && p.type === "simple");
      await Promise.all(
        selectedProducts.map(p => {
          let newPrice = parseFloat(p.price || "0");
          const adj = parseFloat(priceAdjustment.value);

          if (priceAdjustment.type === "fixed") {
            newPrice = adj;
          } else if (priceAdjustment.type === "increase") {
            newPrice = newPrice + adj;
          } else if (priceAdjustment.type === "decrease") {
            newPrice = Math.max(0, newPrice - adj);
          } else if (priceAdjustment.type === "percent_increase") {
            newPrice = newPrice * (1 + adj / 100);
          } else if (priceAdjustment.type === "percent_decrease") {
            newPrice = newPrice * (1 - adj / 100);
          }

          return http.put(`/products/${p.id}`, { price: newPrice.toFixed(2) });
        })
      );
      fetchProducts(currentPage);
      setSelectedIds(new Set());
      setPriceAdjustment({ type: "fixed", value: "" });
      showToast(`Prices updated for ${selectedProducts.length} products`, "success");
    } catch (error) {
      console.error("Failed to adjust prices:", error);
      showToast("Failed to adjust prices", "error");
    } finally {
      setSaving(false);
      setBulkActionDropdown(null);
    }
  };

  // Bulk stock adjustment
  const handleBulkStockAdjust = async () => {
    if (!stockAdjustment.value) return;
    setSaving(true);
    try {
      const selectedProducts = products.filter(p => selectedIds.has(p.id) && p.type === "simple");
      await Promise.all(
        selectedProducts.map(p => {
          let newStock = p.stock || 0;
          const adj = parseInt(stockAdjustment.value);

          if (stockAdjustment.type === "fixed") {
            newStock = adj;
          } else if (stockAdjustment.type === "increase") {
            newStock = newStock + adj;
          } else if (stockAdjustment.type === "decrease") {
            newStock = Math.max(0, newStock - adj);
          }

          return http.put(`/products/${p.id}`, { stock: newStock });
        })
      );
      fetchProducts(currentPage);
      setSelectedIds(new Set());
      setStockAdjustment({ type: "fixed", value: "" });
      showToast(`Stock updated for ${selectedProducts.length} products`, "success");
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      showToast("Failed to adjust stock", "error");
    } finally {
      setSaving(false);
      setBulkActionDropdown(null);
    }
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Store" subtitle="Products">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">Products</h1>
                <p className="text-sm text-neutral-400">Manage your store inventory</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <Package className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">{total} products</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Undo/Redo buttons */}
              <div className="flex items-center gap-1 px-2 py-1 bg-neutral-800/50 rounded-lg">
                <button
                  onClick={() => {
                    const change = undo();
                    if (change) handleUndoChange(change);
                  }}
                  disabled={!canUndo}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const change = redo();
                    if (change) {
                      handleInlineUpdate(change.productId, change.field, String(change.newValue));
                    }
                  }}
                  disabled={!canRedo}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>

              {/* Keyboard shortcuts button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="h-5 w-5" />
              </button>

              {/* Import/Export Button */}
              <Link
                href="/dashboard/products/import-export"
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Import/Export
              </Link>

              <Link
                href="/dashboard/products/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in slide-in-from-top-2">
              {/* Selection Count with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSelectionMenu(!showSelectionMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                  disabled={selectingAll}
                >
                  <CheckSquare className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    {selectingAll ? "Selecting..." : `${selectedIds.size} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>

                {showSelectionMenu && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20">
                    <button
                      onClick={selectAllInStore}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-200 hover:bg-neutral-700 rounded-t-lg transition-colors"
                    >
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                      Select All Products ({total})
                    </button>
                    <button
                      onClick={unselectAll}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-200 hover:bg-neutral-700 rounded-b-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-red-400" />
                      Unselect All
                    </button>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-neutral-700" />

              {/* Bulk Edit Button - NEW */}
              <Link
                href={`/dashboard/products/bulk-edit?ids=${Array.from(selectedIds).join(",")}`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors"
              >
                <Edit className="h-4 w-4" />
                Bulk Edit
              </Link>

              <div className="h-6 w-px bg-neutral-700" />

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setBulkActionDropdown(bulkActionDropdown === "status" ? null : "status")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-200 transition-colors"
                >
                  Change Status
                  <ChevronDown className="h-4 w-4" />
                </button>
                {bulkActionDropdown === "status" && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10">
                    <button
                      onClick={() => handleBulkStatusChange("active")}
                      disabled={saving}
                      className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-neutral-700 rounded-t-lg"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange("draft")}
                      disabled={saving}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-400 hover:bg-neutral-700 rounded-b-lg"
                    >
                      Set Draft
                    </button>
                  </div>
                )}
              </div>

              {/* Price Adjustment Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setBulkActionDropdown(bulkActionDropdown === "price" ? null : "price")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-200 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  Adjust Price
                  <ChevronDown className="h-4 w-4" />
                </button>
                {bulkActionDropdown === "price" && (
                  <div className="absolute top-full left-0 mt-1 w-64 p-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10">
                    <div className="space-y-3">
                      <select
                        value={priceAdjustment.type}
                        onChange={(e) => setPriceAdjustment(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-200"
                      >
                        <option value="fixed">Set to fixed price</option>
                        <option value="increase">Increase by $</option>
                        <option value="decrease">Decrease by $</option>
                        <option value="percent_increase">Increase by %</option>
                        <option value="percent_decrease">Decrease by %</option>
                      </select>
                      <input
                        type="number"
                        value={priceAdjustment.value}
                        onChange={(e) => setPriceAdjustment(p => ({ ...p, value: e.target.value }))}
                        placeholder={priceAdjustment.type.includes("percent") ? "10" : "29.99"}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-200"
                      />
                      <button
                        onClick={handleBulkPriceAdjust}
                        disabled={saving || !priceAdjustment.value}
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm text-white font-medium"
                      >
                        {saving ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Adjustment Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setBulkActionDropdown(bulkActionDropdown === "stock" ? null : "stock")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-200 transition-colors"
                >
                  <Boxes className="h-4 w-4" />
                  Adjust Stock
                  <ChevronDown className="h-4 w-4" />
                </button>
                {bulkActionDropdown === "stock" && (
                  <div className="absolute top-full left-0 mt-1 w-64 p-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10">
                    <div className="space-y-3">
                      <select
                        value={stockAdjustment.type}
                        onChange={(e) => setStockAdjustment(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-200"
                      >
                        <option value="fixed">Set to fixed amount</option>
                        <option value="increase">Increase by</option>
                        <option value="decrease">Decrease by</option>
                      </select>
                      <input
                        type="number"
                        value={stockAdjustment.value}
                        onChange={(e) => setStockAdjustment(p => ({ ...p, value: e.target.value }))}
                        placeholder="10"
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-200"
                      />
                      <button
                        onClick={handleBulkStockAdjust}
                        disabled={saving || !stockAdjustment.value}
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm text-white font-medium"
                      >
                        {saving ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  console.log("🔴 BULK DELETE BUTTON CLICKED!");
                  alert("Delete button clicked! Selected: " + selectedIds.size + " products");
                  handleBulkDelete();
                }}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {/* Clear Selection */}
              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${showFilters || statusFilter !== "all" || stockFilter !== "all"
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== "all" || stockFilter !== "all") && (
                  <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                    {(statusFilter !== "all" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-20">
                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-2">Status</label>
                      <div className="flex gap-2">
                        {[
                          { value: "all", label: "All" },
                          { value: "active", label: "Active" },
                          { value: "draft", label: "Draft" },
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${statusFilter === option.value
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stock Filter */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-2">Stock Level</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "all", label: "All", icon: Package },
                          { value: "in_stock", label: "In Stock", icon: Check },
                          { value: "low_stock", label: "Low Stock", icon: AlertTriangle },
                          { value: "out_of_stock", label: "Out of Stock", icon: PackageX },
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setStockFilter(option.value)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${stockFilter === option.value
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                              }`}
                          >
                            <option.icon className="h-3 w-3" />
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(statusFilter !== "all" || stockFilter !== "all") && (
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setStockFilter("all");
                        }}
                        className="w-full px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700 rounded-lg transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column Selector */}
            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Columns
              </button>

              {showColumnSelector && (
                <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-20">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2 px-1">Toggle Columns</div>
                  {COLUMNS.filter(col => !col.alwaysVisible).map(col => (
                    <button
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {col.editable && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" title="Editable" />}
                        {col.label}
                      </span>
                      {visibleColumns.has(col.id) ? (
                        <Eye className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-neutral-500" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-neutral-700 mt-2 pt-2">
                    <button
                      onClick={() => setVisibleColumns(new Set(COLUMNS.map(c => c.id)))}
                      className="w-full px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      Show All Columns
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <DashboardSection>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-neutral-700 mb-4" />
                <p className="text-neutral-400">No products found</p>
                <Link
                  href="/dashboard/products/new"
                  className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Add your first product
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Scroll controls bar */}
                <div className="flex items-center justify-between mb-3 px-2 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                  <span className="text-xs text-neutral-500">
                    {COLUMNS.filter(c => visibleColumns.has(c.id)).length} columns visible
                  </span>

                  {/* Scroll navigation buttons */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 hidden sm:block">Scroll table:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const container = document.querySelector('.products-table-scroll');
                          if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                        }}
                        className="p-2 bg-neutral-700 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-neutral-400 transition-all border border-neutral-600 hover:border-emerald-500/50"
                        title="Scroll left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const container = document.querySelector('.products-table-scroll');
                          if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                        }}
                        className="p-2 bg-neutral-700 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-neutral-400 transition-all border border-neutral-600 hover:border-emerald-500/50"
                        title="Scroll right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-emerald-400 animate-pulse">← → more columns</span>
                  </div>
                </div>

                {/* Table container with gradient hints */}
                <div className="relative">
                  {/* Left fade indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-900 to-transparent pointer-events-none z-10 opacity-50" />
                  {/* Right fade indicator */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-900 to-transparent pointer-events-none z-10 opacity-50" />

                  <div className="products-table-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800 pb-3" style={{ scrollbarWidth: 'auto' }}>
                    <table className="w-full min-w-[1200px]">
                      <thead>
                        <tr className="border-b border-neutral-800">
                          <th className="w-12 py-3 px-4">
                            <button
                              onClick={selectAll}
                              className="text-neutral-400 hover:text-neutral-200"
                            >
                              {filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id)) ? (
                                <CheckSquare className="h-5 w-5 text-emerald-400" />
                              ) : filteredProducts.some(p => selectedIds.has(p.id)) ? (
                                <Minus className="h-5 w-5" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                          {visibleColumns.has("sku") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">SKU</th>
                          )}
                          {visibleColumns.has("barcode") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Barcode</th>
                          )}
                          {visibleColumns.has("type") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                          )}
                          {visibleColumns.has("price") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Price
                              <span className="ml-1 text-emerald-400 text-[10px]">• editable</span>
                            </th>
                          )}
                          {visibleColumns.has("compare_price") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Compare</th>
                          )}
                          {visibleColumns.has("cost") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Cost</th>
                          )}
                          {visibleColumns.has("stock") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Stock
                              <span className="ml-1 text-emerald-400 text-[10px]">• editable</span>
                            </th>
                          )}
                          {visibleColumns.has("weight") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Weight</th>
                          )}
                          {visibleColumns.has("brand") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Brand</th>
                          )}
                          {visibleColumns.has("product_type") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                          )}
                          {visibleColumns.has("tags") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Tags</th>
                          )}
                          {visibleColumns.has("status") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                          )}
                          {visibleColumns.has("created") && (
                            <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</th>
                          )}
                          <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, rowIndex) => {
                          const editableColumns = COLUMNS.filter(c => c.editable && visibleColumns.has(c.id));

                          return (
                            <tr
                              key={product.id}
                              className={`border-b border-neutral-800/50 transition-colors ${selectedIds.has(product.id)
                                ? "bg-emerald-500/5"
                                : "hover:bg-neutral-800/30"
                                }`}
                            >
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => toggleSelect(product.id)}
                                  className="text-neutral-400 hover:text-neutral-200"
                                >
                                  {selectedIds.has(product.id) ? (
                                    <CheckSquare className="h-5 w-5 text-emerald-400" />
                                  ) : (
                                    <Square className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                              <td className="py-4 px-4">
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                                >
                                  <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all">
                                    {product.image_url ? (
                                      <img src={getFullImageUrl(product.image_url)} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                    ) : (
                                      <Package className="h-5 w-5 text-neutral-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors">{product.name}</p>
                                    <p className="text-xs text-neutral-500">{product.type}</p>
                                  </div>
                                </Link>
                              </td>
                              {visibleColumns.has("sku") && (
                                <td className="py-4 px-4">
                                  {product.type === "variable" ? (
                                    <span className="text-xs text-neutral-500">
                                      {product.variants?.length || 0} variants
                                    </span>
                                  ) : (
                                    <span className="text-sm text-neutral-400 font-mono">{product.sku || "-"}</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("barcode") && (
                                <td className="py-4 px-4">
                                  <span className="text-sm text-neutral-400 font-mono">{product.barcode || "-"}</span>
                                </td>
                              )}
                              {visibleColumns.has("type") && (
                                <td className="py-4 px-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.type === "simple"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-purple-500/10 text-purple-400"
                                    }`}>
                                    {product.type}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.has("price") && (
                                <td className="py-4 px-4">
                                  {product.type === "simple" ? (
                                    <EditableCell
                                      value={product.price || "0"}
                                      prefix="$"
                                      type="number"
                                      onSave={(val) => handleInlineUpdate(product.id, "price", val)}
                                      className="text-sm text-neutral-200"
                                      cellId={`${product.id}-price`}
                                      isActive={activeCell?.rowIndex === rowIndex && activeCell?.colIndex === editableColumns.findIndex(c => c.id === "price")}
                                      onActivate={() => setActiveCell({ rowIndex, colIndex: editableColumns.findIndex(c => c.id === "price") })}
                                      onNavigate={(dir) => handleNavigate(rowIndex, editableColumns.findIndex(c => c.id === "price"), dir)}
                                      isSaving={savingCells.has(`${product.id}-price`)}
                                      justSaved={savedCells.has(`${product.id}-price`)}
                                    />
                                  ) : (
                                    <span className="text-sm text-neutral-200">
                                      {getVariantPriceRange(product.variants)}
                                    </span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("compare_price") && (
                                <td className="py-4 px-4">
                                  {product.compare_at_price ? (
                                    <span className="text-sm text-neutral-400 line-through">${product.compare_at_price}</span>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("cost") && (
                                <td className="py-4 px-4">
                                  {product.cost ? (
                                    <span className="text-sm text-amber-400">${product.cost}</span>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("stock") && (
                                <td className="py-4 px-4">
                                  {product.type === "simple" ? (
                                    <EditableCell
                                      value={product.stock}
                                      type="number"
                                      onSave={(val) => handleInlineUpdate(product.id, "stock", val)}
                                      className={`text-sm ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}
                                      cellId={`${product.id}-stock`}
                                      isActive={activeCell?.rowIndex === rowIndex && activeCell?.colIndex === editableColumns.findIndex(c => c.id === "stock")}
                                      onActivate={() => setActiveCell({ rowIndex, colIndex: editableColumns.findIndex(c => c.id === "stock") })}
                                      onNavigate={(dir) => handleNavigate(rowIndex, editableColumns.findIndex(c => c.id === "stock"), dir)}
                                      isSaving={savingCells.has(`${product.id}-stock`)}
                                      justSaved={savedCells.has(`${product.id}-stock`)}
                                    />
                                  ) : (
                                    <span className={`text-sm ${getVariantTotalStock(product.variants) > 10 ? 'text-emerald-400' : getVariantTotalStock(product.variants) > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                      {getVariantTotalStock(product.variants)}
                                    </span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("weight") && (
                                <td className="py-4 px-4">
                                  {product.weight ? (
                                    <span className="text-sm text-neutral-400">
                                      {product.weight} {product.weight_unit || "kg"}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("brand") && (
                                <td className="py-4 px-4">
                                  {product.brand ? (
                                    <span className="text-sm text-neutral-300">{product.brand}</span>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("product_type") && (
                                <td className="py-4 px-4">
                                  {product.product_type ? (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400">
                                      {product.product_type}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("tags") && (
                                <td className="py-4 px-4">
                                  {product.tags && product.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                      {product.tags.slice(0, 2).map((tag, i) => (
                                        <span key={i} className="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded bg-neutral-700 text-neutral-300">
                                          {tag}
                                        </span>
                                      ))}
                                      {product.tags.length > 2 && (
                                        <span className="text-xs text-neutral-500">+{product.tags.length - 2}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-neutral-500">-</span>
                                  )}
                                </td>
                              )}
                              {visibleColumns.has("status") && (
                                <td className="py-4 px-4">
                                  <button
                                    onClick={() => handleInlineUpdate(product.id, "status", product.status === "active" ? "draft" : "active")}
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${product.status === 'active'
                                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                      : 'bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20'
                                      }`}
                                    title="Click to toggle status"
                                  >
                                    {product.status}
                                  </button>
                                </td>
                              )}
                              {visibleColumns.has("created") && (
                                <td className="py-4 px-4">
                                  <span className="text-sm text-neutral-400">
                                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"}
                                  </span>
                                </td>
                              )}
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    title="Quick Edit"
                                  >
                                    <Zap className="h-4 w-4" />
                                  </button>
                                  <Link
                                    href={`/dashboard/products/${product.id}/edit`}
                                    className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                                    title="Full Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
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
                    onClick={() => fetchProducts(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchProducts(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </DashboardSection>

          {/* Navigation hint */}
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">Tab</kbd>
              Navigate cells
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">Enter</kbd>
              Edit & save
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">Ctrl+Z</kbd>
              Undo
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">?</kbd>
              All shortcuts
            </span>
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer />

        {/* Quick Edit Modal */}
        {
          editingProduct && (
            <QuickEditModal
              product={editingProduct}
              isOpen={!!editingProduct}
              onClose={() => setEditingProduct(null)}
              onSave={(updatedProduct) => {
                setProducts(prev => prev.map(p =>
                  p.id === updatedProduct.id ? (updatedProduct as Product) : p
                ));
                showToast(`"${updatedProduct.name}" updated successfully!`);
              }}
            />
          )
        }

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-neutral-100">تأكيد الحذف</h2>
              </div>
              <p className="text-neutral-300 mb-6">
                هل أنت متأكد من حذف <span className="font-bold text-red-400">{selectedIds.size}</span> منتج؟
                <br />
                <span className="text-sm text-neutral-500">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={executeDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "جاري الحذف..." : "نعم، احذف"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Single Delete Confirmation Modal */}
        {singleDeleteId !== null && (
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
                  onClick={() => setSingleDeleteId(null)}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={executeSingleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  نعم، احذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </DashboardLayout >
    </ProtectedRoute >
  );
}
