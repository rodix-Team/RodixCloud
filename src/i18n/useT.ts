"use client";

import { useI18nStore } from "./store";
import { translate } from "./messages";

export function useT() {
  const locale = useI18nStore((s) => s.locale);
  return (key: string) => translate(locale, key);
}
