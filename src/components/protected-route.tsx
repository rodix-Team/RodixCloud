"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/app-store";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * كتحمي أي صفحة: إلا ماكانش isAuthenticated -> ترجع /login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // شاشة خفيفة حتى يدير الريدايركت
  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-neutral-400 text-sm">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
