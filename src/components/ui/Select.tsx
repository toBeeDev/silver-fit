import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-[15px] font-semibold text-sub-text"
        >
          {label}
        </label>
        <div className="relative mt-2">
          <select
            ref={ref}
            id={id}
            className={cn(
              "block w-full min-h-[52px] appearance-none rounded-xl border bg-white px-4 pr-10 text-[17px] text-foreground",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-transparent",
              error
                ? "border-red-400 ring-1 ring-red-200"
                : "border-border hover:border-primary-200",
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub-text" />
        </div>
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
  },
);

Select.displayName = "Select";

export default Select;
