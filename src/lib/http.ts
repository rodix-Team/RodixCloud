import axios, { AxiosInstance, AxiosError } from "axios";

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// تصدير الـ Base URL للاستعمال في بناء URLs للصور
export const API_BASE_URL = RAW_BASE;

/**
 * بناء URL كامل للصور
 * إذا كانت URL relative، نضيف الـ API base
 */
export function getFullImageUrl(url: string): string {
  if (!url) return "";
  // إذا كانت URL كاملة بالفعل
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // إذا كانت relative path
  return `${RAW_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const http: AxiosInstance = axios.create({
  baseURL: `${RAW_BASE}/api`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 * تعيين / إزالة توكن الأوث
 */
export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("access_token", token);
    }
  } else {
    delete http.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
    }
  }
}

// نحاول نحمّل التوكن من localStorage فجانب المتصفح
if (typeof window !== "undefined") {
  const existing = window.localStorage.getItem("access_token");
  if (existing) {
    http.defaults.headers.common["Authorization"] = `Bearer ${existing}`;
  }
}

// Interceptor بسيط: إلا رجعات 401 نفرّغ التوكن
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
      }
      delete http.defaults.headers.common["Authorization"];
    }
    return Promise.reject(error);
  }
);
