"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ghost, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Lupa Password — Horrorin";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email wajib diisi ya");
      return;
    }
    setLoading(true);
    // Simulasi: tunggu sebentar biar kerasa real
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
    toast.success("Link reset udah dikirim (simulasi) 📧");
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 horror-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Ghost className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">
            Horror<span className="text-primary">in</span>
          </span>
        </Link>

        <div className="glass-strong rounded-3xl p-8">
          {sent ? (
            <div className="text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold">Cek email kamu ya 📧</h1>
              <p className="text-sm text-muted-foreground">
                Link reset password udah dikirim ke <span className="font-semibold text-foreground">{email}</span>. Link ini valid 1 jam.
              </p>
              <p className="text-xs text-muted-foreground">
                Psst... ini cuma simulasi ya. Belum ada email beneran yang dikirim 👻
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/masuk">
                  <Button className="w-full rounded-full bg-primary font-semibold">Balik ke halaman masuk</Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full rounded-full"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  Coba email lain
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/masuk"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Balik ke masuk
              </Link>

              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Lupa password? 🤔</h1>
              <p className="text-sm text-muted-foreground mb-6">
                santai, masukin email kamu. Nanti kita kirim link buat reset password.
              </p>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="kamu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-background/60"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 font-bold text-base gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Lagi ngirim link...
                    </>
                  ) : (
                    "Kirim Link Reset 📧"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Ingat password?{" "}
                <Link href="/masuk" className="text-primary hover:underline font-medium">
                  Masuk dulu 👋
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
