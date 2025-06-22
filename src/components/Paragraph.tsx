import React from "react";

interface ParagraphProps {
  children: React.ReactNode;
  variant?: "default" | "muted" | "small";
  className?: string;
}

export default function Paragraph({
  children,
  variant = "default",
  className = "",
}: ParagraphProps) {
  const variantClasses = {
    default: "text-gray-900",
    muted: "text-gray-600",
    small: "text-sm text-gray-500",
  };

  return (
    <p className={`${variantClasses[variant]} ${className}`}>{children}</p>
  );
}
