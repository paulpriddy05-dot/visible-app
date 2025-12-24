import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  darkBg?: boolean; // Optional prop if placed on dark backgrounds
}

export default function Logo({ className = "h-10 w-auto", iconOnly = false, darkBg = false }: LogoProps) {
  const textColor = darkBg ? "text-white" : "text-slate-900";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* The "Prism V" Icon */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square"
        aria-label="Visible Logo"
      >
        {/* Left facet (Lighter Blue-500) */}
        <path d="M128 96L256 416L0 96H128Z" fill="#3b82f6" opacity="0.9"/>
        {/* Right facet (Brand Blue-600) */}
        <path d="M384 96L256 416L512 96H384Z" fill="#2563eb" />
        {/* Center/Bottom overlap facet (Darker Blue-700 for depth) */}
        <path d="M256 416L128 96L384 96L256 416Z" fill="#1d4ed8" opacity="0.6" style={{ mixBlendMode: 'multiply' }}/>
      </svg>

      {/* The Text (Hidden if iconOnly is true) */}
      {!iconOnly && (
        <span className={`font-sans font-bold text-2xl tracking-tight ${textColor}`}>
          Visible
        </span>
      )}
    </div>
  );
}