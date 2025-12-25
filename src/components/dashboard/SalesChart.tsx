"use client";

import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

export default function SalesChart() {
    const chartRef = useRef<ChartJS<"line">>(null);

    // Demo data - 30 days revenue
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const revenueData = Array.from({ length: 30 }, (_, i) => {
        const base = 250;
        const trend = i * 2;
        const variance = Math.sin(i * 0.5) * 50 + Math.random() * 40;
        return Math.max(0, base + trend + variance);
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Revenue ($)",
                data: revenueData,
                fill: true,
                borderColor: "rgb(16, 185, 129)", // emerald-500
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
                    gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.2)");
                    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
                    return gradient;
                },
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: "rgb(16, 185, 129)",
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2,
                tension: 0.4, // Smooth curve
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                titleColor: "#fff",
                bodyColor: "#10b981",
                borderColor: "rgba(16, 185, 129, 0.3)",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        return `$${context.parsed.y.toFixed(2)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false,
                },
                ticks: {
                    color: "rgba(163, 163, 163, 0.6)",
                    font: {
                        size: 10,
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
            },
            y: {
                display: true,
                grid: {
                    color: "rgba(163, 163, 163, 0.1)",
                    drawBorder: false,
                },
                ticks: {
                    color: "rgba(163, 163, 163, 0.6)",
                    font: {
                        size: 10,
                    },
                    callback: (value: any) => {
                        return `$${value}`;
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index" as const,
        },
        animation: {
            duration: 2000,
            easing: "easeInOutQuart" as const,
        },
    };

    return (
        <div className="w-full h-full">
            <Line ref={chartRef} data={data} options={options} />
        </div>
    );
}
