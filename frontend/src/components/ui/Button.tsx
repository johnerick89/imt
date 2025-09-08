import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "default", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100",
      ghost:
        "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg",
    };

    const combinedClassName = [
      baseStyles,
      variants[variant],
      sizes[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button className={combinedClassName} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
