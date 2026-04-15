import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "primary" | "secondary";
}

export function Section({
  children,
  className,
  id,
  background = "secondary",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "section-padding",
        background === "primary" ? "bg-bg-primary" : "bg-bg-secondary",
        className
      )}
    >
      <div className="container mx-auto">{children}</div>
    </section>
  );
}
