import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "../../hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
  variant = "button",
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus ${className}`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <Sun size={iconSizes[size]} className="text-text-primary" />
        ) : (
          <Moon size={iconSizes[size]} className="text-text-primary" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-quaternary border border-border text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <>
          <Sun size={iconSizes[size]} />
          <span className="text-sm font-medium">라이트 모드</span>
        </>
      ) : (
        <>
          <Moon size={iconSizes[size]} />
          <span className="text-sm font-medium">다크 모드</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
