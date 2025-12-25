"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout, DashboardSection } from "@/components/dashboard";
import {
    Truck, Plus, Edit2, Trash2, MapPin, DollarSign,
    Globe, Clock, Package, Check
} from "lucide-react";

interface ShippingZone {
    id: number;
    name: string;
    countries: string[];
    methods: {
        name: string;
        price: number;
        estimated_days: string;
    }[];
}

const DEMO_ZONES: ShippingZone[] = [
    {
        id: 1,
        name: "Domestic",
        countries: ["Kuwait"],
        methods: [
            { name: "Standard Delivery", price: 2.00, estimated_days: "2-3 days" },
            { name: "Express Delivery", price: 5.00, estimated_days: "Same day" },
        ],
    },
    {
        id: 2,
        name: "GCC Countries",
        countries: ["Saudi Arabia", "UAE", "Bahrain", "Qatar", "Oman"],
        methods: [
            { name: "Standard Shipping", price: 10.00, estimated_days: "5-7 days" },
            { name: "Express Shipping", price: 25.00, estimated_days: "2-3 days" },
        ],
    },
    {
        id: 3,
        name: "International",
        countries: ["Rest of World"],
        methods: [
            { name: "International Shipping", price: 30.00, estimated_days: "10-14 days" },
        ],
    },
];

export default function ShippingPage() {
    const [zones, setZones] = useState(DEMO_ZONES);

    return (
        <ProtectedRoute>
            <DashboardLayout title="Management" subtitle="Shipping">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-100">Shipping</h1>
                            <p className="text-sm text-neutral-400">Manage shipping zones and rates</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                            <Plus className="h-4 w-4" />
                            Add Zone
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <Truck className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-blue-400 font-medium">Shipping Zones Configuration</p>
                            <p className="text-blue-400/80 text-sm">Configure shipping zones and delivery methods for your store regions.</p>
                        </div>
                    </div>

                    {/* Shipping Zones */}
                    <div className="space-y-4">
                        {zones.map((zone) => (
                            <DashboardSection key={zone.id}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-emerald-400" />
                                            {zone.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {zone.countries.map((country) => (
                                                <span
                                                    key={country}
                                                    className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded-lg"
                                                >
                                                    {country}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {zone.methods.map((method, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Truck className="h-5 w-5 text-neutral-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-200">{method.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                        <Clock className="h-3 w-3" />
                                                        {method.estimated_days}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-emerald-400">
                                                    ${method.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DashboardSection>
                        ))}
                    </div>

                    {/* Free Shipping Info */}
                    <DashboardSection>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 rounded-lg">
                                    <Package className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-neutral-200">Free Shipping Threshold</h4>
                                    <p className="text-sm text-neutral-500">Orders above this amount get free shipping</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-neutral-500" />
                                    <input
                                        type="number"
                                        defaultValue="100"
                                        className="w-20 bg-transparent text-neutral-100 focus:outline-none"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                                    <Check className="h-4 w-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </DashboardSection>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
