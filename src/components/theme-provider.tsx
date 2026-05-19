"use client";

import * as React from "react";

export type Theme = "light" | "dark";

const ThemeContext = React.createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    // The inline pre-hydration script in layout.tsx already applied the right
    // .dark class to <html>. Mirror that into React state so our toggle UI is
    // in sync. Reading from the DOM avoids a useState→setState round-trip.
    const initial: Theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    if (initial !== theme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(initial);
    }
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
