"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Clear localStorage and reset to light mode
    localStorage.removeItem("theme");

    // Force remove any dark classes
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");

    // Set light as default
    setTheme("light");
  }, []);

  const updateTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove both classes from both elements
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    if (newTheme === "dark") {
      root.classList.add("dark");
    }

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    updateTheme(newTheme);
  };

  // Don't render children until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: updateTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
