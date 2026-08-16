"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, Store, User } from "lucide-react";
import { useDict } from "@/i18n";
import { Logo } from "@/components/public/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";

export function RegisterPage() {
  const t = useDict();
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const schema = z
    .object({
      name: z.string().min(1, t.auth.nameRequired),
      email: z.string().email(t.auth.emailInvalid),
      phone: z.string().regex(/^[+]?[\d\s-]{10,15}$/, t.auth.phoneInvalid),
      password: z.string().min(8, t.auth.passwordMin),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: t.auth.passwordMismatch });

  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "+91 " },
  });

  const [accountType, setAccountType] = React.useState<"CUSTOMER" | "SELLER">(
    params.get("type") === "seller" ? "SELLER" : "CUSTOMER",
  );
  const [language, setLanguage] = React.useState("en");

  const onSubmit = async (values: Values) => {
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
        preferredLanguage: language,
        accountType,
      });
      toast({ title: t.auth.registerSuccess, variant: "success" });
      router.push(accountType === "SELLER" ? "/seller" : "/app");
    } catch (err) {
      toast({ title: t.auth.registerError, description: (err as Error).message, variant: "error" });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.auth.registerTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.auth.registerSubtitle}</p>

          <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.auth.accountType}>
            {(["CUSTOMER", "SELLER"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={accountType === type}
                onClick={() => setAccountType(type)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  accountType === type
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {type === "CUSTOMER" ? <User className="size-4" /> : <Store className="size-4" />}
                {type === "CUSTOMER" ? t.auth.customer : t.auth.seller}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg-name">{t.auth.name}</Label>
                <Input id="reg-name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">{t.auth.phone}</Label>
                <Input id="reg-phone" type="tel" autoComplete="tel" {...register("phone")} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">{t.auth.email}</Label>
              <Input id="reg-email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t.auth.password}</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? t.auth.hide : t.auth.show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">{t.auth.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm((s) => !s)} aria-label={showConfirm ? t.auth.hide : t.auth.show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.auth.preferredLanguage}</Label>
                <Select
                  value={language}
                  onChange={setLanguage}
                  ariaLabel={t.auth.preferredLanguage}
                  options={[
                    { value: "en", label: t.common.english },
                    { value: "hi", label: t.common.hindi },
                    { value: "mr", label: t.common.marathi },
                  ]}
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground">{t.common.languageName}</p>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold" size="lg" loading={isSubmitting}>
              {!isSubmitting && <UserPlus className="size-4 mr-2" aria-hidden />}
              {t.auth.createAccount}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
