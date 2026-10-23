"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ghost, Mail, Lock, User, AtSign, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouteTransition } from "@/components/ui/route-transition";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import Image from "next/image";

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(/^[a-z0-9_]+$/, "Nama pengguna hanya boleh berisi huruf kecil, angka, dan garis bawah."),
    email: z.string().email("Masukkan alamat email yang valid."),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Kata sandi tidak cocok.",
    path: ["confirm"],
  });

export default function GabungPage() {
  const router = useRouter();
  const { start } = useRouteTransition();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Gabung Horrorin — Komunitas Horror Indonesia";
  }, []);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "username" ? e.target.value.toLowerCase() : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(fieldErrors[Object.keys(fieldErrors)[0]] ?? "Periksa kembali formulir.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
      });

      toast.success("Akun berhasil dibuat. Sedang masuk...");
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Akun berhasil dibuat, tetapi kamu perlu masuk secara manual.");
        start();
        router.push("/masuk");
        return;
      }
      toast.success("Selamat datang di Horrorin.");
      start();
      router.push("/");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error((e.data as { error?: string } | undefined)?.error ?? "Pendaftaran gagal. Coba lagi.");
      } else {
        toast.error("Terjadi kesalahan. Coba lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden horror-gradient">
        {/* <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" /> */}

        <div className="relative flex flex-col justify-between p-12 xl:p-16 text-white">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            {/* <Ghost className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Horror<span className="text-primary">in</span>
            </span> */}
            <Image src="/assets/logo.svg" alt="Horrorin Logo" width={100} height={100} className="w-50" />
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
              Bergabung dengan komunitas cerita horor Indonesia
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Tulis dan bagikan cerita horor. Pilih template, susun ceritamu, lalu terbitkan.
            </p>
            <ul className="space-y-3 pt-2">
              <Feature text="Gunakan berbagai template cerita" />
              <Feature text="Dapatkan notifikasi saat ceritamu disukai" />
              <Feature text="Simpan cerita untuk dibaca nanti" />
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Horrorin.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Balik ke beranda
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-sm">
              {/* <Ghost className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">
                Horror<span className="text-primary">in</span>
              </span> */}
              <Image src="/assets/logo.svg" alt="Horrorin Logo" width={100} height={100} className="w-30" />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Gabung Horrorin</h2>
              <p className="text-sm text-muted-foreground">
                Udah punya akun?{" "}
                <Link href="/masuk" className="text-primary hover:underline font-medium">
                  Masuk dulu 
                </Link>
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Field
                id="name"
                label="Nama"
                icon={<User className="w-4 h-4" />}
                placeholder="Nama kamu"
                value={form.name}
                onChange={update("name")}
                error={errors.name}
                autoComplete="name"
                autoFocus
              />
              <Field
                id="username"
                label="Username"
                icon={<AtSign className="w-4 h-4" />}
                placeholder="username_keren"
                value={form.username}
                onChange={update("username")}
                error={errors.username}
                autoComplete="username"
                hint="Huruf kecil, angka, underscore. 3-20 karakter."
              />
              <Field
                id="email"
                label="Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="kamu@email.com"
                value={form.email}
                onChange={update("email")}
                error={errors.email}
                autoComplete="email"
              />

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={update("password")}
                    className={cn(
                      "pl-9 pr-10 bg-background/60",
                      errors.password && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Field
                id="confirm"
                label="Konfirmasi Password"
                type={showPassword ? "text" : "password"}
                icon={<Lock className="w-4 h-4" />}
                placeholder="Ulangin password"
                value={form.confirm}
                onChange={update("confirm")}
                error={errors.confirm}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 font-bold text-base gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  "Gabung Horrorin"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Dengan membuat akun, kamu menyetujui Kebijakan Privasi Horrorin.
            </p>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}

function Field({
  id,
  label,
  icon,
  hint,
  error,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input
          id={id}
          type={type}
          className={cn(
            "pl-9 bg-background/60",
            error && "border-destructive focus-visible:ring-destructive/30"
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-primary" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}
