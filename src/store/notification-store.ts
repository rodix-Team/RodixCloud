import { create } from "zustand";

export type Notification = {
    id: string;
    type: "order" | "payment" | "stock" | "info";
    title: string;
    message: string;
    time: Date;
    read: boolean;
    data?: Record<string, unknown>;
};

type NotificationState = {
    notifications: Notification[];
    lastOrderCount: number;
    soundEnabled: boolean;
    addNotification: (notif: Omit<Notification, "id" | "time" | "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    setLastOrderCount: (count: number) => void;
    toggleSound: () => void;
};

// Sound effect for new orders
const playNotificationSound = () => {
    if (typeof window !== "undefined") {
        try {
            const audio = new Audio("/sounds/notification.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Fallback: browser beep
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                oscillator.connect(ctx.destination);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.15);
            });
        } catch (e) {
            console.log("Sound not supported");
        }
    }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    lastOrderCount: 0,
    soundEnabled: true,

    addNotification: (notif) => {
        const newNotif: Notification = {
            ...notif,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            time: new Date(),
            read: false,
        };

        set((state) => ({
            notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep max 50
        }));

        // Play sound for new orders
        if (notif.type === "order" && get().soundEnabled) {
            playNotificationSound();
        }
    },

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    clearAll: () => set({ notifications: [] }),

    setLastOrderCount: (count) => set({ lastOrderCount: count }),

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));

// Helper to get unread count
export const useUnreadCount = () =>
    useNotificationStore((state) => state.notifications.filter((n) => !n.read).length);
