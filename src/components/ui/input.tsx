import * as React from 'react';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { FormErrorMessage } from './FormErrorMessage';

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
  /** ID for the error message (for ARIA purposes) */
  errorId?: string;
  /** Description for the input (for ARIA purposes) */
  description?: string;
  /** ID for the description (for ARIA purposes) */
  descriptionId?: string;
}

function Input({
  className,
  type: initialType = 'text',
  leftIcon,
  rightIcon,
  isInvalid = false,
  errorMessage,
  isValid,
  showPasswordToggle,
  errorId,
  description,
  descriptionId,
  ...props
}: InputProps) {
  const [type, setType] = React.useState(initialType);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setType(type === 'password' ? 'text' : 'password');
  };
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {leftIcon && (
        <div className="input-icon-left">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'input w-full border border-border bg-transparent px-4 py-2 text-sm',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
          'placeholder:text-muted disabled:opacity-50 disabled:cursor-not-allowed',
          'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          leftIcon && 'input-with-icon-left pl-10',
          (rightIcon ||
            isValid ||
            isInvalid ||
            (initialType === 'password' && showPasswordToggle)) &&
            'input-with-icon-right pr-10',
          isInvalid && 'input-error border-red-500 focus-visible:ring-red-500',
          isValid && 'input-success border-green-500 focus-visible:ring-green-500',
          className
        )}
        aria-invalid={isInvalid ? 'true' : 'false'}
        aria-describedby={cn(
          errorMessage && isInvalid ? errorId || `${props.id || props.name}-error` : undefined,
          description ? descriptionId || `${props.id || props.name}-description` : undefined
        )}
        {...props}
      />
      {isValid && !rightIcon && (
        <div className="input-icon-right text-green-500">
          <Check className="h-4 w-4" />
        </div>
      )}
      {isInvalid && !rightIcon && (
        <div className="input-icon-right text-red-500">
          <AlertCircle className="h-4 w-4" />
        </div>
      )}
      {initialType === 'password' && showPasswordToggle && (
        <button
          type="button"
          className="input-icon-right text-muted hover:text-foreground"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={type === 'password' ? 'Show password' : 'Hide password'}
        >
          {type === 'password' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
      {rightIcon &&
        !isValid &&
        !isInvalid &&
        !(initialType === 'password' && showPasswordToggle) && (
          <div className="input-icon-right text-muted">
            {rightIcon}
          </div>
        )}
      {errorMessage && isInvalid && (
        <FormErrorMessage
          message={errorMessage}
          id={errorId || `${props.id || props.name}-error`}
        />
      )}

      {description && (
        <p
          id={descriptionId || `${props.id || props.name}-description`}
          className="mt-2 text-xs font-medium text-zinc-500"
        >
          {description}
        </p>
      )}
    </div>
  );
}

export { Input };
