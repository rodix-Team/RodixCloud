"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { http, setAuthToken } from "@/lib/http";
import { useAuthStore } from "@/store/app-store";

export default function LoginPage() {
  const router = useRouter();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await http.post("/login", { email, password });

      const token =
        (res.data as any)?.token ??
        (res.data as any)?.access_token ??
        null;
      const user = (res.data as any)?.user ?? null;

      if (!token || !user) {
        throw new Error("Invalid response from API");
      }

      // خزن التوكن فـ axios + localStorage
      setAuthToken(token);

      // خزن الأوث فـ Zustand
      setAuth({ user, token });

      // مشي للداشبورد (ممكن نبدلو المسار من بعد)
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check your credentials.";

      setError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/80 border border-neutral-800 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900 border-neutral-700 focus-visible:ring-neutral-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-900 border-neutral-700 pr-16 focus-visible:ring-neutral-400"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-xs text-neutral-400 hover:text-neutral-200"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-neutral-50 text-neutral-900 hover:bg-neutral-200"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
