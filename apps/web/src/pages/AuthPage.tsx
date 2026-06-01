import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api, setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Vui lòng nhập tên.").max(50),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    if (user) navigate("/decks", { replace: true });
  }, [user, navigate]);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) =>
      api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
    onSuccess: ({ user, access_token }) => {
      setAccessToken(access_token);
      setUser(user);
      navigate("/decks");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
    onSuccess: ({ user, access_token }) => {
      setAccessToken(access_token);
      setUser(user);
      navigate("/decks");
    },
  });

  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-3">
            <span className="font-hanzi text-3xl text-white font-bold">学</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FriFlash</h1>
          <p className="text-sm text-gray-500 mt-1">Học tiếng Trung mỗi ngày</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-2 p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t
                  ? "bg-surface shadow-sm text-primary"
                  : "text-gray-500"
              }`}
            >
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <form
            onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
            className="space-y-4"
          >
            <Field
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register("email")}
            />
            <Field
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register("password")}
            />
            {loginMutation.error && (
              <p className="text-xs text-unknown text-center">
                Email hoặc mật khẩu không đúng.
              </p>
            )}
            <SubmitButton loading={loginMutation.isPending}>Đăng nhập</SubmitButton>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}
            className="space-y-4"
          >
            <Field
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              error={registerForm.formState.errors.name?.message}
              {...registerForm.register("name")}
            />
            <Field
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={registerForm.formState.errors.email?.message}
              {...registerForm.register("email")}
            />
            <Field
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              error={registerForm.formState.errors.password?.message}
              {...registerForm.register("password")}
            />
            <Field
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              error={registerForm.formState.errors.confirmPassword?.message}
              {...registerForm.register("confirmPassword")}
            />
            {registerMutation.error && (
              <p className="text-xs text-unknown text-center">
                Đăng ký thất bại. Vui lòng thử lại.
              </p>
            )}
            <SubmitButton loading={registerMutation.isPending}>Đăng ký</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

// --- sub-components ---

import { forwardRef } from "react";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          id={fieldId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors
            bg-surface placeholder:text-gray-400
            focus:border-primary focus:ring-2 focus:ring-primary/20
            ${error ? "border-unknown" : "border-border"}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-unknown">{error}</p>}
      </div>
    );
  }
);

function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm
        hover:bg-primary-dark active:scale-[0.98] transition-all
        disabled:opacity-60 disabled:cursor-not-allowed mt-2"
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}
