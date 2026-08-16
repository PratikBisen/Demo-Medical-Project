import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("mx-auto max-w-2xl pb-6 pt-6 text-center sm:pt-12", className)}
    >
      <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>}
    </motion.div>
  );
}
