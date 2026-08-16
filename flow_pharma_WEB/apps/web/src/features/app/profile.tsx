"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User as UserIcon, Mail, Phone } from "lucide-react";
import { useDict } from "@/i18n";
import { useCurrentUser, useUpdateProfile } from "@/hooks/queries";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/services/auth";

export function ProfilePage() {
  const t = useDict();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const update = useUpdateProfile();
  const { toast } = useToast();

  const schema = z.object({
    fullName: z.string().min(1, t.auth.nameRequired),
    email: z.string().email(t.auth.emailInvalid),
    phone: z.string().regex(/^[+]?[\d\s-]{10,15}$/, t.auth.phoneInvalid),
  });

  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: React.useMemo(
      () => ({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }),
      [user],
    ),
  });

  const onSubmit = async (values: Values) => {
    await update.mutateAsync(values);
    toast({ title: t.common.save, variant: "success" });
  };

  const signOut = () => {
    authService.logout();
    router.replace("/");
  };

  if (!user) return null;

  const initials = user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t.app.profileTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.profileSubtitle}</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar initials={initials} className="size-16 text-lg" tone="flow" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold">
              {user.fullName}
              <Badge variant="flow">{user.role}</Badge>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" aria-hidden /> {user.email}
            </p>
            {user.phone && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" aria-hidden /> {user.phone}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="p-name">{t.auth.name}</Label>
            <Input id="p-name" {...register("fullName")} aria-invalid={!!errors.fullName} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-email">{t.auth.email}</Label>
              <Input id="p-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">{t.auth.phone}</Label>
              <Input id="p-phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="flow" loading={isSubmitting}>{t.common.save}</Button>
            <Button type="button" variant="outline" onClick={() => reset()}>{t.common.cancel}</Button>
          </div>
        </form>
      </Card>

      <Card className="flex items-center justify-between p-6">
        <div>
          <p className="font-semibold">{t.common.logout}</p>
          <p className="text-sm text-muted-foreground">{t.app.settingsSubtitle}</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <UserIcon className="size-4" aria-hidden />
          {t.common.logout}
        </Button>
      </Card>
    </div>
  );
}
