"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { useDict } from "@/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DemoBanner } from "@/components/shared/demo-banner";

export function ContactPage() {
  const t = useDict();
  const [sent, setSent] = React.useState(false);

  const schema = z.object({
    name: z.string().min(1, t.contact.nameRequired),
    email: z.string().email(t.contact.emailInvalid),
    subject: z.string().min(1, t.contact.subjectRequired),
    message: z.string().min(10, t.contact.messageRequired),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_values: FormValues) => {
    await new Promise((r) => setTimeout(r, 1100));
    reset();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6 lg:px-8">
      <PageHeader title={t.contact.title} subtitle={t.contact.subtitle} />

      <div className="mb-6">
        <DemoBanner message={t.contact.demoNote} />
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center"
            role="status"
          >
            <CheckCircle2 className="mx-auto size-10 text-emerald-500" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">{t.contact.successTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.contact.successBody}</p>
            <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
              {t.common.back}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">{t.contact.name}</Label>
                <Input id="c-name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">{t.contact.email}</Label>
                <Input id="c-email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-subject">{t.contact.subject}</Label>
              <Input id="c-subject" {...register("subject")} aria-invalid={!!errors.subject} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-message">{t.contact.message}</Label>
              <Textarea id="c-message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground font-semibold" loading={isSubmitting}>
              {!isSubmitting && <Send className="size-4 mr-2" aria-hidden />}
              {t.contact.send}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
