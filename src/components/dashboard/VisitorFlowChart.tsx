"use client";

import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type VisitorFlowChartProps = {
    browsing?: number;
    inCart?: number;
    checkout?: number;
};

export default function VisitorFlowChart({
    browsing = 124,
    inCart = 47,
    checkout = 23,
}: VisitorFlowChartProps) {
    const chartRef = useRef<ChartJS<"doughnut">>(null);

    const data = {
        labels: ["Browsing", "In Cart", "Checkout"],
        datasets: [
            {
                label: "Visitors",
                data: [browsing, inCart, checkout],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.8)", // emerald-500 - browsing
                    "rgba(234, 179, 8, 0.8)", // amber-500 - cart
                    "rgba(249, 115, 22, 0.8)", // orange-500 - checkout
                ],
                borderColor: [
                    "rgb(16, 185, 129)",
                    "rgb(234, 179, 8)",
                    "rgb(249, 115, 22)",
                ],
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                titleColor: "#fff",
                bodyColor: "#a3a3a3",
                borderColor: "rgba(163, 163, 163, 0.3)",
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context: any) => {
                        const total = browsing + inCart + checkout;
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1500,
            easing: "easeInOutQuart" as const,
        },
    };

    const total = browsing + inCart + checkout;
    const conversionRate = total > 0 ? ((checkout / browsing) * 100).toFixed(1) : 0;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <Doughnut ref={chartRef} data={data} options={options} />

            {/* Center text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-bold text-neutral-50">{total}</div>
                <div className="text-xs text-neutral-400 mt-1">Total visitors</div>
                <div className="text-xs text-emerald-400 mt-2">
                    {conversionRate}% conversion
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-[10px] text-neutral-400">
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Browsing</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Cart</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Checkout</span>
                </div>
            </div>
        </div>
    );
}
