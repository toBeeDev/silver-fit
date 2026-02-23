import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
}

export default function Card({
  as: Tag = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-border bg-white p-6",
        "shadow-[var(--shadow-sm)]",
        "transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
