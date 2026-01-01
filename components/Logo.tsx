import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  darkBg?: boolean; // Optional prop if placed on dark backgrounds
}

export default function Logo({ className = "h-10 w-auto", iconOnly = false, darkBg = false }: LogoProps) {
  const textColor = darkBg ? "text-white" : "text-slate-900";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 🟢 THE UPDATE: Replaced SVG with your Image file */}
      <Image
        src="/logo.png"
        alt="Visible Logo"
        width={100}
        height={100}
        className="h-full w-auto object-contain"
        priority // Loads immediately since it's above the fold
      />

      {/* The Text (Hidden if iconOnly is true) */}
      {!iconOnly && (
        <span className={`font-sans font-bold text-2xl tracking-tight ${textColor}`}>
          Visible
        </span>
      )}
    </div>
  );
}