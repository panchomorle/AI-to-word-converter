'use client';

/**
 * Theme Context and Provider
 * 
 * This module provides React context for theme management.
 * It handles theme switching, persistence, and CSS variable application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Theme, ThemeId, ThemeContextValue, ThemeColors } from '@/lib/themes/types';
import { getTheme, getAllThemes, DEFAULT_THEME_ID, THEME_STORAGE_KEY } from '@/lib/themes';

/**
 * Default context value (used before provider is mounted)
 */
const defaultContextValue: ThemeContextValue = {
  theme: getTheme(DEFAULT_THEME_ID),
  themeId: DEFAULT_THEME_ID,
  setTheme: () => {},
  availableThemes: getAllThemes(),
};

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
}

/**
 * Convert camelCase to kebab-case for CSS variable names
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Apply theme colors as CSS custom properties
 */
function applyThemeToDocument(colors: ThemeColors): void {
  const root = document.documentElement;
  
  // Map theme colors to CSS variables
  const cssVariableMap: Record<keyof ThemeColors, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    chart1: '--chart-1',
    chart2: '--chart-2',
    chart3: '--chart-3',
    chart4: '--chart-4',
    chart5: '--chart-5',
    sidebar: '--sidebar',
    sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary',
    sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent',
    sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border',
    sidebarRing: '--sidebar-ring',
    scrollbarTrack: '--scrollbar-track',
    scrollbarThumb: '--scrollbar-thumb',
    scrollbarThumbHover: '--scrollbar-thumb-hover',
    scrollbarThumbActive: '--scrollbar-thumb-active',
  };
  
  // Apply each color as a CSS variable
  for (const [key, cssVar] of Object.entries(cssVariableMap)) {
    const colorKey = key as keyof ThemeColors;
    root.style.setProperty(cssVar, colors[colorKey]);
  }
}

/**
 * Get stored theme ID from localStorage
 */
function getStoredThemeId(): ThemeId | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['dark', 'light', 'sepia'].includes(stored)) {
      return stored as ThemeId;
    }
  } catch {
    // localStorage may not be available
  }
  
  return null;
}

/**
 * Store theme ID in localStorage
 */
function storeThemeId(themeId: ThemeId): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // localStorage may not be available
  }
}

/**
 * Props for AppThemeProvider
 */
interface AppThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme ID (defaults to stored or DEFAULT_THEME_ID) */
  defaultTheme?: ThemeId;
}

/**
 * Application Theme Provider
 * 
 * Wraps the application and provides theme context to all children.
 * Handles theme persistence and CSS variable application.
 */
export function AppThemeProvider({ 
  children, 
  defaultTheme = DEFAULT_THEME_ID 
}: AppThemeProviderProps) {
  // Initialize with stored theme or default
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultTheme);
  const [mounted, setMounted] = useState(false);
  
  // Get current theme object
  const theme = getTheme(themeId);
  
  // Load stored theme on mount
  useEffect(() => {
    const storedTheme = getStoredThemeId();
    if (storedTheme) {
      setThemeIdState(storedTheme);
    }
    setMounted(true);
  }, []);
  
  // Apply theme colors whenever theme changes
  useEffect(() => {
    if (mounted) {
      applyThemeToDocument(theme.colors);
      // Update data attribute for potential CSS selectors
      document.documentElement.setAttribute('data-theme', themeId);
    }
  }, [theme, themeId, mounted]);
  
  // Theme setter with persistence
  const setTheme = useCallback((newThemeId: ThemeId) => {
    setThemeIdState(newThemeId);
    storeThemeId(newThemeId);
  }, []);
  
  // Context value
  const contextValue: ThemeContextValue = {
    theme,
    themeId,
    setTheme,
    availableThemes: getAllThemes(),
  };
  
  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
