import * as React from "react"

import { cn } from "@/src/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "authflow-flex authflow-h-10 authflow-w-full authflow-rounded-md authflow-border authflow-border-slate-200 authflow-bg-white authflow-px-3 authflow-py-2 authflow-text-sm authflow-ring-offset-white file:authflow-border-0 file:authflow-bg-transparent file:authflow-text-sm file:authflow-font-medium placeholder:authflow-text-slate-500 focus-visible:authflow-outline-none focus-visible:authflow-ring-2 focus-visible:authflow-ring-slate-950 focus-visible:authflow-ring-offset-2 disabled:authflow-cursor-not-allowed disabled:authflow-opacity-50 dark:authflow-border-slate-800 dark:authflow-bg-slate-950 dark:authflow-ring-offset-slate-950 dark:placeholder:authflow-text-slate-400 dark:focus-visible:authflow-ring-slate-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
