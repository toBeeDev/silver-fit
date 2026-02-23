import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-[15px] font-semibold text-sub-text"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={cn(
            "mt-2 block w-full min-h-[52px] rounded-xl border bg-white px-4 text-[17px] text-foreground",
            "placeholder:text-sub-text/60",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-transparent",
            error
              ? "border-red-400 ring-1 ring-red-200"
              : "border-border hover:border-primary-200",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-[15px] text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
