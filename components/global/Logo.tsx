import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  /**
   * The size of the logo
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * The tagline to display beneath the logo
   */
  tagline?: string;

  /**
   * The URL to navigate to when the logo is clicked
   */
  href?: string;

  /**
   * Whether to use dark mode colors
   */
  darkMode?: boolean;

  /**
   * Additional CSS classes to apply to the logo container
   */
  className?: string;

  /**
   * Whether to show only the icon without text
   */
  iconOnly?: boolean;
}

/**
 * SINORAY Logo Component
 *
 * A reusable logo component with integrated truck icon,
 * optional tagline, and clickable functionality.
 */
export const Logo: React.FC<LogoProps> = ({
  size = "md",
  tagline = "Quality Carriage Trucks",
  href = "/",
  darkMode = false,
  className = "",
  iconOnly = false,
}) => {
  // Size mapping for different logo sizes
  const sizes = {
    xs: {
      container: "h-6",
      logo: "text-lg",
      tagline: "text-xs",
      iconHeight: 16,
      iconOffsetY: -1,
    },
    sm: {
      container: "h-8",
      logo: "text-xl",
      tagline: "text-xs",
      iconHeight: 18,
      iconOffsetY: -1,
    },
    md: {
      container: "h-10",
      logo: "text-2xl",
      tagline: "text-sm",
      iconHeight: 22,
      iconOffsetY: -1,
    },
    lg: {
      container: "h-12",
      logo: "text-3xl",
      tagline: "text-sm",
      iconHeight: 26,
      iconOffsetY: -1,
    },
    xl: {
      container: "h-16",
      logo: "text-4xl",
      tagline: "text-base",
      iconHeight: 34,
      iconOffsetY: -2,
    },
  };

  // Color definitions for light and dark mode
  const colors = {
    light: {
      text: "text-slate-800",
      textHighlight: "text-red-600",
      textHighlight2: "text-blue-600",
      iconPrimary: "#dc2626", // red-600
      iconSecondary: "#2563eb", // blue-600
      iconFill: "#f87171", // red-400
      tagline: "text-slate-600",
    },
    dark: {
      text: "text-white",
      textHighlight: "text-red-400",
      textHighlight2: "text-blue-400",
      iconPrimary: "#f87171", // red-400
      iconSecondary: "#60a5fa", // blue-400
      iconFill: "#fca5a5", // red-300
      tagline: "text-slate-300",
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;
  const currentSize = sizes[size];

  // Whole component with logo and tagline
  return (
    <div className={`flex flex-col ${className}`}>
      <Link
        href={href}
        className="flex items-center transition-opacity hover:opacity-80 focus:opacity-80"
      >
        <Image
          width={500}
          height={500}
          src="/green-link.jpeg"
          alt=""
          className="w-32"
        />
      </Link>
    </div>
  );
};

export default Logo;
