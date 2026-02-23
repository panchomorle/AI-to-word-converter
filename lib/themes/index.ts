/**
 * Theme System - Main Entry Point
 * 
 * This file exports all themes and theme-related utilities.
 * Import from this file for clean imports throughout the app.
 */

// Type exports
export type { Theme, ThemeColors, ThemeId, ThemeContextValue } from './types';

// Individual theme exports
export { darkTheme } from './dark';
export { lightTheme } from './light';
export { sepiaTheme } from './sepia';

// Theme registry
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { sepiaTheme } from './sepia';
import type { Theme, ThemeId } from './types';

/**
 * Registry of all available themes
 */
export const themes: Record<ThemeId, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  sepia: sepiaTheme,
};

/**
 * Get a theme by its ID
 */
export function getTheme(themeId: ThemeId): Theme {
  return themes[themeId] ?? darkTheme;
}

/**
 * Get list of all available themes
 */
export function getAllThemes(): Theme[] {
  return Object.values(themes);
}

/**
 * Default theme ID
 */
export const DEFAULT_THEME_ID: ThemeId = 'dark';

/**
 * Local storage key for persisting theme preference
 */
export const THEME_STORAGE_KEY = 'MDWord-theme';
