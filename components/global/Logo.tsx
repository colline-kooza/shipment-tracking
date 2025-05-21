import React from "react";
import Link from "next/link";

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
 * TrakIT Logo Component
 *
 * A modern logo component with integrated tracking icon,
 * optional tagline, and clickable functionality.
 */
export const Logo: React.FC<LogoProps> = ({
  size = "md",
  tagline = "Smart Tracking Solutions",
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
      iconSize: 16,
      iconOffsetY: -1,
    },
    sm: {
      container: "h-8",
      logo: "text-xl",
      tagline: "text-xs",
      iconSize: 18,
      iconOffsetY: -1,
    },
    md: {
      container: "h-10",
      logo: "text-2xl",
      tagline: "text-sm",
      iconSize: 22,
      iconOffsetY: -1,
    },
    lg: {
      container: "h-12",
      logo: "text-3xl",
      tagline: "text-sm",
      iconSize: 26,
      iconOffsetY: -1,
    },
    xl: {
      container: "h-16",
      logo: "text-4xl",
      tagline: "text-base",
      iconSize: 34,
      iconOffsetY: -2,
    },
  };

  // Color definitions for light and dark mode
  const colors = {
    light: {
      text: "text-slate-800",
      textHighlight: "text-emerald-600",
      textHighlight2: "text-blue-600",
      tagline: "text-slate-600",
    },
    dark: {
      text: "text-white",
      textHighlight: "text-emerald-400",
      textHighlight2: "text-blue-400",
      tagline: "text-slate-300",
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;
  const currentSize = sizes[size];

  // SVG icon for the logo
  const LogoIcon = ({ size, isDarkMode }:any) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block mr-2"
    >
      <path 
        d="M12 2L2 7L12 12L22 7L12 2Z" 
        fill={isDarkMode ? "#34d399" : "#059669"} 
        stroke={isDarkMode ? "#34d399" : "#059669"} 
        strokeWidth="1.5" 
      />
      <path 
        d="M2 17L12 22L22 17" 
        stroke={isDarkMode ? "#60a5fa" : "#2563eb"} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M2 12L12 17L22 12" 
        stroke={isDarkMode ? "#60a5fa" : "#2563eb"} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );

  // Whole component with logo and tagline
  return (
    <div className={`flex flex-col ${className}`}>
      <Link
        href={href}
        className="flex items-center transition-opacity hover:opacity-80 focus:opacity-80"
      >
        <div className={`flex items-center ${currentSize.container}`}>
          <LogoIcon size={currentSize.iconSize} isDarkMode={darkMode} />
          
          {!iconOnly && (
            <div className="flex items-baseline">
              <span className={`font-bold tracking-tight ${currentSize.logo} ${currentColors.text}`}>
                Trak<span className={currentColors.textHighlight}>IT</span>
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {!iconOnly && tagline && (
        <div className={`mt-1 ${currentSize.tagline} ${currentColors.tagline}`}>
          {tagline}
        </div>
      )}
    </div>
  );
};

export default Logo;