"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "./image-upload";

type VariantOption = {
  name: string;
  values: string[];
};

type Variant = {
  id: string;
  sku: string;
  price: string;
  stock: string;
  attributes: Record<string, string>;
  images: { id: string; url: string; isPrimary?: boolean }[];
  // Shipping fields
  weight: string;
  weight_unit: string;
  length: string;
  width: string;
  height: string;
  dimension_unit: string;
};

type VariantBuilderProps = {
  options: VariantOption[];
  variants: Variant[];
  onOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: Variant[]) => void;
};

export function VariantBuilder({
  options,
  variants,
  onOptionsChange,
  onVariantsChange,
}: VariantBuilderProps) {
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // إضافة خيار جديد (مثل اللون أو الحجم)
  const addOption = () => {
    onOptionsChange([...options, { name: "", values: [""] }]);
  };

  // حذف خيار
  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);
    regenerateVariants(newOptions);
  };

  // تحديث اسم الخيار
  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    onOptionsChange(newOptions);
  };

  // إضافة قيمة للخيار
  const addOptionValue = (optionIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.push("");
    onOptionsChange(newOptions);
  };

  // تحديث قيمة
  const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[optionIndex].values[valueIndex] = value;
    onOptionsChange(newOptions);
  };

  // حذف قيمة
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
    onOptionsChange(newOptions);
  };

  // توليد المتغيرات تلقائياً
  const regenerateVariants = (opts: VariantOption[] = options) => {
    const validOptions = opts.filter(o => o.name && o.values.some(v => v));

    if (validOptions.length === 0) {
      onVariantsChange([]);
      return;
    }

    // Cartesian product
    const combinations = validOptions.reduce<Record<string, string>[]>(
      (acc, option) => {
        const trimmedName = option.name.trim();
        const validValues = option.values.filter(v => v).map(v => v.trim());
        if (acc.length === 0) {
          return validValues.map(v => ({ [trimmedName]: v }));
        }
        return acc.flatMap(combo =>
          validValues.map(v => ({ ...combo, [trimmedName]: v }))
        );
      },
      []
    );

    const newVariants: Variant[] = combinations.map((attrs, index) => {
      // حاول تلقى variant موجود بنفس الـ attributes
      const existing = variants.find(v =>
        JSON.stringify(v.attributes) === JSON.stringify(attrs)
      );

      if (existing) return existing;

      // SKU تلقائي
      const skuParts = Object.values(attrs).map(v =>
        v.substring(0, 3).toUpperCase()
      );

      return {
        id: generateId(),
        sku: `VAR-${skuParts.join("-")}-${index + 1}`,
        price: "",
        stock: "0",
        attributes: attrs,
        images: [],
        // Shipping defaults
        weight: "",
        weight_unit: "kg",
        length: "",
        width: "",
        height: "",
        dimension_unit: "cm",
      };
    });

    onVariantsChange(newVariants);
  };

  // تحديث variant
  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    const newVariants = variants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    );
    onVariantsChange(newVariants);
  };

  return (
    <div className="space-y-6">
      {/* Options Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-neutral-300">Product Options</h4>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-3 w-3" />
            Add Option
          </button>
        </div>

        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="p-4 bg-neutral-800/50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={option.name}
                onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                placeholder="Option name (e.g., Color, Size)"
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value, valueIndex) => (
                <div key={valueIndex} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                    placeholder="Value"
                    className="w-24 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  {option.values.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOptionValue(optionIndex, valueIndex)}
                      className="p-1 text-neutral-500 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOptionValue(optionIndex)}
                className="px-2 py-1.5 border border-dashed border-neutral-600 rounded text-xs text-neutral-400 hover:text-neutral-300 hover:border-neutral-500"
              >
                + Add
              </button>
            </div>
          </div>
        ))}

        {options.length > 0 && options.some(o => o.name && o.values.some(v => v)) && (
          <button
            type="button"
            onClick={() => regenerateVariants()}
            className="w-full py-2 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/10 transition-colors"
          >
            Generate Variants ({variants.length})
          </button>
        )}
      </div>

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-300">
            Variants ({variants.length})
          </h4>

          {variants.map((variant) => (
            <div
              key={variant.id}
              className="border border-neutral-700 rounded-lg overflow-hidden"
            >
              {/* Variant Header */}
              <div
                className="flex items-center justify-between p-3 bg-neutral-800/50 cursor-pointer"
                onClick={() => setExpandedVariant(
                  expandedVariant === variant.id ? null : variant.id
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-neutral-700 flex items-center justify-center">
                    {variant.images.length > 0 ? (
                      <img
                        src={variant.images[0].url}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {Object.values(variant.attributes).join(" / ")}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">{variant.sku}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral-200">
                      {variant.price ? `$${variant.price}` : "No price"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Stock: {variant.stock}
                    </p>
                  </div>
                  {expandedVariant === variant.id ? (
                    <ChevronUp className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  )}
                </div>
              </div>

              {/* Variant Details */}
              {expandedVariant === variant.id && (
                <div className="p-4 space-y-4 border-t border-neutral-700">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 font-mono focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Price</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Stock</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, "stock", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div className="pt-3 border-t border-neutral-700">
                    <h5 className="text-xs font-medium text-neutral-400 mb-3">Shipping</h5>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-neutral-500 mb-1">Weight</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={variant.weight}
                            onChange={(e) => updateVariant(variant.id, "weight", e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                          />
                          <select
                            value={variant.weight_unit}
                            onChange={(e) => updateVariant(variant.id, "weight_unit", e.target.value)}
                            className="px-2 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Length</label>
                        <input
                          type="number"
                          value={variant.length}
                          onChange={(e) => updateVariant(variant.id, "length", e.target.value)}
                          placeholder="0"
                          step="0.1"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Width</label>
                        <input
                          type="number"
                          value={variant.width}
                          onChange={(e) => updateVariant(variant.id, "width", e.target.value)}
                          placeholder="0"
                          step="0.1"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Height</label>
                        <input
                          type="number"
                          value={variant.height}
                          onChange={(e) => updateVariant(variant.id, "height", e.target.value)}
                          placeholder="0"
                          step="0.1"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Unit</label>
                        <select
                          value={variant.dimension_unit}
                          onChange={(e) => updateVariant(variant.id, "dimension_unit", e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200"
                        >
                          <option value="cm">cm</option>
                          <option value="m">m</option>
                          <option value="in">in</option>
                          <option value="ft">ft</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-2">
                      Variant Images (max 3)
                    </label>
                    <ImageUpload
                      images={variant.images}
                      onChange={(images) => updateVariant(variant.id, "images", images)}
                      maxImages={3}
                      showPrimarySelector={false}
                      folder="variants"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
