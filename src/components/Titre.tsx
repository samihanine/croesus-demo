import React from "react";

interface TitreProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export default function Titre({
  children,
  level = 1,
  className = "",
}: TitreProps) {
  const baseClasses = "font-bold mb-4";
  const colorClass = "text-[#E12C38]";

  const sizeClasses = {
    1: "text-4xl",
    2: "text-2xl mb-6",
    3: "text-lg mb-3",
    4: "text-base mb-2",
    5: "text-sm mb-2",
    6: "text-xs mb-1",
  };

  return React.createElement(
    `h${level}`,
    {
      className: `${baseClasses} ${sizeClasses[level]} ${colorClass} ${className}`,
    },
    children
  );
}
