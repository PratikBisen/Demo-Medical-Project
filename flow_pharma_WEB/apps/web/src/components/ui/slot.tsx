import * as React from "react";
import { cn } from "@/lib/utils";

export function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  return React.cloneElement(
    React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
    { ...props },
  );
}
