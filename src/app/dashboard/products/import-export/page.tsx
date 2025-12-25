"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard";
import { http } from "@/lib/http";
import {
    ArrowLeft, Download, Upload, FileSpreadsheet, Loader2,
    CheckCircle, XCircle, AlertTriangle, FileDown, FileUp
} from "lucide-react";

type Product = {
    id: number;
    name: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    stock: number;
    status: string;
    type: string;
    description: string;
    short_description: string;
    weight: string;
    weight_unit: string;
    length: string;
    width: string;
    height: string;
    dimension_unit: string;
    categories: { id: number; name: string }[];
};

type ImportResult = {
    success: number;
    failed: number;
    errors: string[];
};

export default function ImportExportPage() {
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

    // Export products to CSV
    const handleExport = async () => {
        try {
            setExporting(true);
            setError("");
            setExportSuccess(false);

            // Fetch all products
            let allProducts: Product[] = [];
            let currentPage = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await http.get("/products", {
                    params: { per_page: 100, page: currentPage }
                });
                const products = response.data.data || [];
                allProducts = [...allProducts, ...products];
                hasMore = currentPage < (response.data.last_page || 1);
                currentPage++;
                if (currentPage > 100) break; // Safety limit
            }

            // Create CSV content
            const headers = [
                "ID", "Name", "SKU", "Price", "Regular Price", "Sale Price",
                "Stock", "Status", "Type", "Description", "Short Description",
                "Weight", "Weight Unit", "Length", "Width", "Height", "Dimension Unit",
                "Categories"
            ];

            const rows = allProducts.map(p => [
                p.id,
                `"${(p.name || "").replace(/"/g, '""')}"`,
                p.sku || "",
                p.price || "",
                p.regular_price || "",
                p.sale_price || "",
                p.stock || 0,
                p.status || "",
                p.type || "",
                `"${(p.description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
                `"${(p.short_description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
                p.weight || "",
                p.weight_unit || "",
                p.length || "",
                p.width || "",
                p.height || "",
                p.dimension_unit || "",
                `"${(p.categories || []).map(c => c.name).join(", ")}"`
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
            ].join("\n");

            // Download file
            const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err: any) {
            console.error("Export failed:", err);
            setError(err.message || "Failed to export products");
        } finally {
            setExporting(false);
        }
    };

    // Parse CSV file
    const parseCSV = (text: string): string[][] => {
        const lines = text.split("\n");
        const result: string[][] = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            const row: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === "," && !inQuotes) {
                    row.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            row.push(current.trim());
            result.push(row);
        }

        return result;
    };

    // Import products from CSV
    const handleImport = async (file: File) => {
        try {
            setImporting(true);
            setError("");
            setImportResult(null);

            const text = await file.text();
            const rows = parseCSV(text);

            if (rows.length < 2) {
                setError("CSV file is empty or has no data rows");
                return;
            }

            const headers = rows[0].map(h => h.toLowerCase().trim());
            const dataRows = rows.slice(1);

            let success = 0;
            let failed = 0;
            const errors: string[] = [];

            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                try {
                    const productData: Record<string, any> = {};

                    headers.forEach((header, idx) => {
                        const value = row[idx] || "";

                        switch (header) {
                            case "name":
                                productData.name = value;
                                break;
                            case "sku":
                                productData.sku = value;
                                break;
                            case "price":
                            case "regular price":
                                productData.regular_price = value;
                                break;
                            case "sale price":
                                productData.sale_price = value;
                                break;
                            case "stock":
                                productData.stock = parseInt(value) || 0;
                                break;
                            case "status":
                                productData.status = value || "active";
                                break;
                            case "type":
                                productData.type = value || "simple";
                                break;
                            case "description":
                                productData.description = value;
                                break;
                            case "short description":
                                productData.short_description = value;
                                break;
                            case "weight":
                                productData.weight = value;
                                break;
                            case "weight unit":
                                productData.weight_unit = value;
                                break;
                            case "length":
                                productData.length = value;
                                break;
                            case "width":
                                productData.width = value;
                                break;
                            case "height":
                                productData.height = value;
                                break;
                            case "dimension unit":
                                productData.dimension_unit = value;
                                break;
                        }
                    });

                    // Check if product has ID (update) or not (create)
                    const idIndex = headers.indexOf("id");
                    const productId = idIndex >= 0 ? parseInt(row[idIndex]) : null;

                    if (productId && !isNaN(productId)) {
                        // Update existing product
                        await http.put(`/products/${productId}`, productData);
                    } else {
                        // Create new product
                        if (!productData.name) {
                            throw new Error("Product name is required");
                        }
                        await http.post("/products", productData);
                    }

                    success++;
                } catch (err: any) {
                    failed++;
                    errors.push(`Row ${i + 2}: ${err.response?.data?.message || err.message || "Unknown error"}`);
                }
            }

            setImportResult({ success, failed, errors });
        } catch (err: any) {
            console.error("Import failed:", err);
            setError(err.message || "Failed to import products");
        } finally {
            setImporting(false);
        }
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
            handleImport(file);
        } else {
            setError("Please upload a CSV file");
        }
    };

    // Handle file input
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImport(file);
        }
    };

    // Download sample CSV
    const downloadSample = () => {
        const sampleData = `Name,SKU,Price,Stock,Status,Type,Description
"Sample Product 1",SKU001,29.99,100,active,simple,"This is a sample product"
"Sample Product 2",SKU002,49.99,50,active,simple,"Another sample product"
"Sample Variable",SKU003,99.99,0,active,variable,"A variable product"`;

        const blob = new Blob(["\ufeff" + sampleData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sample_products_import.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <ProtectedRoute>
            <DashboardLayout title="Products" subtitle="Import/Export">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/products"
                            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-neutral-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Import / Export Products</h1>
                            <p className="text-sm text-neutral-400">Bulk manage your products with CSV files</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Export Section */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <FileDown className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-neutral-100">Export Products</h2>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Download all your products as a CSV file. You can use this file to backup your products or edit them in Excel/Google Sheets.
                                </p>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting}
                                    className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    {exporting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : exportSuccess ? (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Downloaded!
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Export All Products
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import Section */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <FileUp className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-neutral-100">Import Products</h2>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Upload a CSV file to create or update products in bulk. Products with an ID will be updated, products without an ID will be created.
                                </p>

                                {/* Drop Zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                    className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                                            ? "border-blue-500 bg-blue-500/10"
                                            : "border-neutral-700 hover:border-neutral-600"
                                        }`}
                                >
                                    {importing ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                            <p className="text-sm text-neutral-400">Importing products...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="h-10 w-10 text-neutral-600 mx-auto" />
                                            <p className="mt-3 text-sm text-neutral-400">
                                                Drag and drop your CSV file here, or
                                            </p>
                                            <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-200 cursor-pointer transition-colors">
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileInput}
                                                    className="hidden"
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>

                                {/* Sample Download */}
                                <button
                                    onClick={downloadSample}
                                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    📄 Download sample CSV template
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import Result */}
                    {importResult && (
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-neutral-100 mb-4">Import Results</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                        <span className="text-2xl font-bold text-emerald-400">{importResult.success}</span>
                                    </div>
                                    <p className="text-sm text-neutral-400 mt-1">Products imported successfully</p>
                                </div>
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-400" />
                                        <span className="text-2xl font-bold text-red-400">{importResult.failed}</span>
                                    </div>
                                    <p className="text-sm text-neutral-400 mt-1">Products failed</p>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                                        Errors
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto bg-neutral-800/50 rounded-lg p-3">
                                        {importResult.errors.map((error, idx) => (
                                            <p key={idx} className="text-xs text-red-400 py-1">
                                                {error}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-neutral-100 mb-4">📋 CSV Format Guide</h3>
                        <div className="space-y-3 text-sm text-neutral-400">
                            <p><strong className="text-neutral-200">Required columns:</strong> Name</p>
                            <p><strong className="text-neutral-200">Optional columns:</strong> ID, SKU, Price, Regular Price, Sale Price, Stock, Status, Type, Description, Short Description, Weight, Weight Unit, Length, Width, Height, Dimension Unit, Categories</p>
                            <p><strong className="text-neutral-200">Update existing:</strong> Include the product ID to update. Leave empty to create new.</p>
                            <p><strong className="text-neutral-200">Status values:</strong> active, draft, archived</p>
                            <p><strong className="text-neutral-200">Type values:</strong> simple, variable</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
