import { create } from "zustand";
import { persist } from "zustand/middleware";

// نوع المستخدم اللي كيرجع من الباك
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
};

type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

/**
 * Store ديال الأوث (تسجيل الدخول)
 * متخزن فـ localStorage تحت الاسم "rodix-auth"
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: ({ user, token }) =>
        set(() => ({
          user,
          token,
          isAuthenticated: true,
        })),
      logout: () =>
        set(() => ({
          user: null,
          token: null,
          isAuthenticated: false,
        })),
    }),
    {
      name: "rodix-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Store ديال الـ Theme (light / dark / system)
 * متخزن فـ localStorage تحت الاسم "rodix-theme"
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "rodix-theme",
    }
  )
);
