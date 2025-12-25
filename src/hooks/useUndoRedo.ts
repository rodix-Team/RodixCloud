import { useState, useCallback, useEffect } from "react";

type HistoryEntry<T> = {
    state: T;
    timestamp: number;
    description?: string;
};

type UndoRedoReturn<T> = {
    addToHistory: (state: T, description?: string) => void;
    undo: () => T | null;
    redo: () => T | null;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
};

/**
 * Hook for managing undo/redo functionality
 * @param maxHistory - Maximum number of history entries to keep (default: 20)
 */
export function useUndoRedo<T>(maxHistory: number = 20): UndoRedoReturn<T> {
    const [history, setHistory] = useState<HistoryEntry<T>[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const addToHistory = useCallback((state: T, description?: string) => {
        setHistory(prev => {
            // Remove any redo entries if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1);

            // Add new entry
            const entry: HistoryEntry<T> = {
                state,
                timestamp: Date.now(),
                description,
            };

            newHistory.push(entry);

            // Trim if exceeds max
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                return newHistory;
            }

            return newHistory;
        });

        setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
    }, [currentIndex, maxHistory]);

    const undo = useCallback((): T | null => {
        if (currentIndex <= 0) return null;

        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        return history[newIndex]?.state ?? null;
    }, [currentIndex, history]);

    const redo = useCallback((): T | null => {
        if (currentIndex >= history.length - 1) return null;

        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        return history[newIndex]?.state ?? null;
    }, [currentIndex, history]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setCurrentIndex(-1);
    }, []);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    return {
        addToHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
    };
}

export type ProductChange = {
    productId: number;
    field: string;
    oldValue: string | number;
    newValue: string | number;
};
