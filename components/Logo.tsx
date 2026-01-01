import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  darkBg?: boolean;
}

export default function Logo({ className = "h-10 w-auto", iconOnly = false, darkBg = false }: LogoProps) {
  const textColor = darkBg ? "text-white" : "text-slate-900";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {/* The Logo Image */}
      <Image
        src="/logo.svg"
        alt="Visible Logo"
        width={40}
        height={40}
        className="h-full w-auto object-contain"
        priority
      />

      {/* The Text (Hidden if iconOnly is true) */}
      {!iconOnly && (
        <span className={`font-sans font-bold text-2xl tracking-tight ${textColor}`}>
          Visible
        </span>
      )}
    </Link>
  );
}