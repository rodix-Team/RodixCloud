"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertCircle, Undo2 } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "undo";

type ToastProps = {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
    onUndo?: () => void;
};

export function Toast({ message, type = "success", duration = 3000, onClose, onUndo }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <Check className="h-4 w-4" />,
        error: <X className="h-4 w-4" />,
        info: <AlertCircle className="h-4 w-4" />,
        undo: <Undo2 className="h-4 w-4" />,
    };

    const styles = {
        success: "bg-emerald-500/90 border-emerald-400 text-white",
        error: "bg-red-500/90 border-red-400 text-white",
        info: "bg-blue-500/90 border-blue-400 text-white",
        undo: "bg-amber-500/90 border-amber-400 text-white",
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ${styles[type]
                } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
            {type === "undo" && onUndo && (
                <button
                    onClick={onUndo}
                    className="ml-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                    Undo
                </button>
            )}
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Toast container for managing multiple toasts
type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
    onUndo?: () => void;
};

export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: ToastType = "success", onUndo?: () => void) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, onUndo }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ transform: `translateY(-${index * 60}px)` }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                        onUndo={toast.onUndo}
                    />
                </div>
            ))}
        </div>
    );

    return { showToast, ToastContainer };
}
