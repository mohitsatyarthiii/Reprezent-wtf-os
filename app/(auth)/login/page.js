"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("No profile found. Please contact admin.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: "var(--color-primary)", filter: "blur(80px)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "var(--color-muted-foreground)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* Logo Image */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden
    bg-(--color-muted) border border-(--color-border)"
            style={{
              boxShadow: "0 10px 25px -5px var(--color-primary)",
            }}
          >
            <img
              src="/logo.png"
              alt="Heek-E OS"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `
          <div class="w-full h-full flex items-center justify-center">
            <svg class="w-8 h-8" style="color: var(--color-foreground)" ...>...</svg>
          </div>
        `;
              }}
            />
          </div>

          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-foreground)" }}
          >
            Reprezent-OS
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Agency Operating System
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-xl border p-8"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Welcome Text */}
          <div className="mb-6">
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--color-foreground)" }}
            >
              Welcome back
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Sign in to access your agency workspace
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@heeke.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: "var(--color-muted)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-primary)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-border)")
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: "var(--color-muted)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--color-primary)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-border)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs hover:underline"
                style={{ color: "var(--color-muted-foreground)" }}
                onClick={() =>
                  alert("Please contact your admin to reset your password")
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm flex items-center gap-2"
                style={{
                  backgroundColor: "var(--color-destructive)15",
                  border: "1px solid var(--color-destructive)30",
                  color: "var(--color-destructive)",
                }}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-current animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div
            className="mt-6 pt-6 border-t text-center"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Only authorized personnel can access this system.
              <br />
              <button
                className="hover:underline mt-1"
                style={{ color: "var(--color-primary)" }}
                onClick={() => alert("Please contact your admin for access")}
              >
                Contact admin
              </button>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div
          className="flex items-center justify-center gap-2 mt-6 text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <Shield className="w-3 h-3" />
          <span>Enterprise-grade security</span>
          <span>•</span>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
