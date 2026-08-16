"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useDict } from "@/i18n";
import { Logo } from "@/components/public/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { authService, demoCredentials } from "@/services/auth";

export function LoginPage() {
  const t = useDict();
  const router = useRouter();
  const { toast } = useToast();
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  const schema = z.object({
    email: z.string().email(t.auth.emailInvalid),
    password: z.string().min(1, t.auth.fillAll),
  });

  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    try {
      const res = await authService.login({ email: values.email, password: values.password, rememberMe: remember });
      toast({ title: t.auth.loginSuccess, variant: "success" });
      router.push(res.redirectTo ?? "/app");
    } catch (err) {
      toast({ title: t.auth.loginError, description: (err as Error).message, variant: "error" });
    }
  };

  const fillDemo = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "demo1234", { shouldValidate: true });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.auth.loginTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.auth.loginSubtitle}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email">{t.auth.email}</Label>
              <Input id="login-email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t.auth.password}</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? t.auth.hide : t.auth.show}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={remember} onCheckedChange={setRemember} ariaLabel={t.auth.remember} />
                <Label className="text-sm text-muted-foreground">{t.auth.remember}</Label>
              </div>
              <button type="button" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                {t.auth.forgot}
              </button>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold" size="lg" loading={isSubmitting}>
              {!isSubmitting && <LogIn className="size-4 mr-2" aria-hidden />}
              {t.auth.signIn}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              {t.auth.register}
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card/60 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            {t.auth.demoAccounts}
          </p>
          <div className="mt-3 space-y-1.5">
            {demoCredentials.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillDemo(cred.email)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/50"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{cred.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{cred.email}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">demo1234</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">{t.auth.adminDemo}</p>
        </div>
      </motion.div>
    </div>
  );
}
