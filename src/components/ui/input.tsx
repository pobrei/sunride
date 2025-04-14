import * as React from "react"
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional left icon */
  leftIcon?: React.ReactNode;
  /** Optional right icon */
  rightIcon?: React.ReactNode;
  /** Whether the input is invalid */
  isInvalid?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the input is valid */
  isValid?: boolean;
  /** Whether to show password toggle for password inputs */
  showPasswordToggle?: boolean;
}

function Input({
  className,
  type: initialType = "text",
  leftIcon,
  rightIcon,
  isInvalid,
  errorMessage,
  isValid,
  showPasswordToggle,
  ...props
}: InputProps) {
  const [type, setType] = React.useState(initialType);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setType(type === "password" ? "text" : "password");
  };
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base inner-shadow transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:shadow-none",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "hover:border-primary/50",
          leftIcon && "pl-10",
          (rightIcon || isValid || isInvalid || (initialType === "password" && showPasswordToggle)) && "pr-10",
          isInvalid && "border-destructive",
          isValid && "border-green-500",
          className
        )}
        {...(isInvalid ? { 'aria-invalid': 'true' } : {})}
        {...props}
      />
      {isValid && !rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
          <Check className="h-4 w-4" />
        </div>
      )}
      {isInvalid && !rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
          <AlertCircle className="h-4 w-4" />
        </div>
      )}
      {initialType === "password" && showPasswordToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={type === "password" ? "Show password" : "Hide password"}
        >
          {type === "password" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
      {rightIcon && !isValid && !isInvalid && !(initialType === "password" && showPasswordToggle) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {rightIcon}
        </div>
      )}
      {errorMessage && isInvalid && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export { Input }
