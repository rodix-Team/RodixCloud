import type { Locale } from "./store";

type Messages = Record<string, string>;

const en: Messages = {
  "nav.overview": "Overview",
  "nav.stores": "Stores",
  "nav.customers": "Customers",
  "nav.billing": "Billing",
  "nav.analytics": "Analytics",
  "header.globalOverview": "Global overview",
  "auth.logout": "Logout",
  "auth.loggingOut": "Logging out...",
};

const ar: Messages = {
  "nav.overview": "نظرة عامة",
  "nav.stores": "المتاجر",
  "nav.customers": "العملاء",
  "nav.billing": "الفواتير",
  "nav.analytics": "التحليلات",
  "header.globalOverview": "نظرة عامة عالمية",
  "auth.logout": "تسجيل الخروج",
  "auth.loggingOut": "جاري تسجيل الخروج...",
};

const dictionaries: Record<Locale, Messages> = {
  en,
  ar,
};

export function translate(locale: Locale, key: string): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  return dict[key] ?? key;
}
