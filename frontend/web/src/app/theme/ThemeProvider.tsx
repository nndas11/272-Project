"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { lightTheme, darkTheme, getComponentColors, Theme } from "./colors";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  currentTheme: ThemeType;
  colors: Theme;
  componentColors: ReturnType<typeof getComponentColors>;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as ThemeType | null;
    
    // Check system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
    } else {
      setThemeState(savedTheme);
    }
  }, []);

  const colors = theme === "light" ? lightTheme : darkTheme;
  const componentColors = getComponentColors(colors);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: theme,
        colors,
        componentColors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback for development - return light theme if provider not found
    console.warn("useTheme must be used within ThemeProvider. Using default light theme.");
    return {
      name: "light" as const,
      colors: lightTheme,
      componentColors: getComponentColors(lightTheme),
      toggleTheme: () => console.warn("toggleTheme called outside ThemeProvider"),
      setTheme: () => console.warn("setTheme called outside ThemeProvider"),
    };
  }
  return {
    name: context.currentTheme,
    colors: context.colors,
    componentColors: context.componentColors,
    toggleTheme: context.toggleTheme,
    setTheme: context.setTheme,
  };
}
