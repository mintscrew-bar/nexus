import React, { createContext, useContext, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

interface ThemeContextType {
  theme: "dark" | "light";
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeUtils = useTheme();

  useEffect(() => {
    // 시스템 테마 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? "dark" : "light";
      // 사용자가 명시적으로 테마를 설정하지 않았다면 시스템 테마를 따름
      if (!localStorage.getItem("theme")) {
        themeUtils.setTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themeUtils]);

  return (
    <ThemeContext.Provider value={themeUtils}>{children}</ThemeContext.Provider>
  );
};
