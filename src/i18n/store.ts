import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ar";

type I18nState = {
  locale: Locale;
  setLocale: (lng: Locale) => void;
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (lng) => set({ locale: lng }),
    }),
    {
      name: "rodix-locale",
    }
  )
);
