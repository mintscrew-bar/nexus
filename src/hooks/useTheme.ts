import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export const useTheme = () => {
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    // HTML 요소에 data-theme 속성 적용
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // 로컬 스토리지에 테마 저장
    localStorage.setItem("nexus-theme", theme);

    // 메타 태그 업데이트 (선택사항)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0f0f23" : "#ffffff"
      );
    }
  }, [theme]);

  // 초기 테마 설정
  useEffect(() => {
    const savedTheme = localStorage.getItem("nexus-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme as "dark" | "light");
    } else if (prefersDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const setDarkTheme = () => {
    setTheme("dark");
  };

  const setLightTheme = () => {
    setTheme("light");
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
};
