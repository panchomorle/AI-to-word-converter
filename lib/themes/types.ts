/**
 * Theme system type definitions
 * 
 * This file contains all TypeScript interfaces and types for the theme system.
 * It follows the Interface Segregation Principle, keeping types clean and focused.
 */

/**
 * CSS custom properties for theming
 * These map directly to CSS variables used throughout the application
 */
export interface ThemeColors {
  // Core colors
  background: string;
  foreground: string;
  
  // Card colors
  card: string;
  cardForeground: string;
  
  // Popover colors
  popover: string;
  popoverForeground: string;
  
  // Primary accent colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Muted colors for subtle elements
  muted: string;
  mutedForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Destructive action colors
  destructive: string;
  destructiveForeground: string;
  
  // Border and input colors
  border: string;
  input: string;
  ring: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  
  // Scrollbar colors
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  scrollbarThumbActive: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  /** Unique identifier for the theme */
  id: string;
  /** Display name for the theme */
  name: string;
  /** Brief description of the theme */
  description: string;
  /** Icon name from lucide-react (optional) */
  icon?: string;
  /** Theme color palette */
  colors: ThemeColors;
}

/**
 * Available theme identifiers
 */
export type ThemeId = 'dark' | 'light' | 'sepia';

/**
 * Theme context value type
 */
export interface ThemeContextValue {
  /** Current active theme */
  theme: Theme;
  /** Current theme identifier */
  themeId: ThemeId;
  /** Function to change the active theme */
  setTheme: (themeId: ThemeId) => void;
  /** List of all available themes */
  availableThemes: Theme[];
}
