import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/utils";

const buttonVariants = cva(
  "authflow-inline-flex authflow-items-center authflow-justify-center authflow-whitespace-nowrap authflow-rounded-md authflow-text-sm authflow-font-medium authflow-ring-offset-white authflow-transition-colors focus-visible:authflow-outline-none focus-visible:authflow-ring-2 focus-visible:authflow-ring-slate-950 focus-visible:authflow-ring-offset-2 disabled:authflow-pointer-events-none disabled:authflow-opacity-50 dark:authflow-ring-offset-slate-950 dark:focus-visible:authflow-ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "authflow-bg-slate-900 authflow-text-slate-50 hover:authflow-bg-slate-900/90 dark:authflow-bg-slate-50 dark:authflow-text-slate-900 dark:hover:authflow-bg-slate-50/90",
        destructive:
          "authflow-bg-red-500 authflow-text-slate-50 hover:authflow-bg-red-500/90 dark:authflow-bg-red-900 dark:authflow-text-slate-50 dark:hover:authflow-bg-red-900/90",
        outline:
          "authflow-border authflow-border-slate-200 authflow-bg-white hover:authflow-bg-slate-100 hover:authflow-text-slate-900 dark:authflow-border-slate-800 dark:authflow-bg-slate-950 dark:hover:authflow-bg-slate-800 dark:hover:authflow-text-slate-50",
        secondary:
          "authflow-bg-slate-100 authflow-text-slate-900 hover:authflow-bg-slate-100/80 dark:authflow-bg-slate-800 dark:authflow-text-slate-50 dark:hover:authflow-bg-slate-800/80",
        ghost:
          "hover:authflow-bg-slate-100 hover:authflow-text-slate-900 dark:hover:authflow-bg-slate-800 dark:hover:authflow-text-slate-50",
        link: "authflow-text-slate-900 authflow-underline-offset-4 hover:authflow-underline dark:authflow-text-slate-50",
      },
      size: {
        default: "authflow-h-10 authflow-px-4 authflow-py-2",
        sm: "authflow-h-9 authflow-rounded-md authflow-px-3",
        lg: "authflow-h-11 authflow-rounded-md authflow-px-8",
        icon: "authflow-h-10 authflow-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
