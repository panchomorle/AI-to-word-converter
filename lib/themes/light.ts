/**
 * Light (Bright) Theme Definition
 * 
 * A clean, bright theme with excellent readability.
 * Features a white background with blue accent colors.
 */

import type { Theme } from './types';

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  description: 'Clean and bright theme for daytime use',
  icon: 'Sun',
  colors: {
    // Core colors
    background: 'oklch(0.99 0.002 240)',
    foreground: 'oklch(0.15 0.01 240)',
    
    // Card colors
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.15 0.01 240)',
    
    // Popover colors
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.15 0.01 240)',
    
    // Primary accent colors (vibrant blue)
    primary: 'oklch(0.55 0.18 240)',
    primaryForeground: 'oklch(0.99 0.002 240)',
    
    // Secondary colors
    secondary: 'oklch(0.95 0.01 240)',
    secondaryForeground: 'oklch(0.25 0.01 240)',
    
    // Muted colors
    muted: 'oklch(0.94 0.01 240)',
    mutedForeground: 'oklch(0.45 0.01 240)',
    
    // Accent colors
    accent: 'oklch(0.55 0.18 240)',
    accentForeground: 'oklch(0.99 0.002 240)',
    
    // Destructive colors
    destructive: 'oklch(0.55 0.22 27)',
    destructiveForeground: 'oklch(0.99 0.002 240)',
    
    // Border and input
    border: 'oklch(0.88 0.01 240)',
    input: 'oklch(0.96 0.005 240)',
    ring: 'oklch(0.55 0.18 240)',
    
    // Chart colors
    chart1: 'oklch(0.55 0.18 240)',
    chart2: 'oklch(0.6 0.15 180)',
    chart3: 'oklch(0.5 0.12 300)',
    chart4: 'oklch(0.7 0.18 80)',
    chart5: 'oklch(0.6 0.2 30)',
    
    // Sidebar colors
    sidebar: 'oklch(0.97 0.005 240)',
    sidebarForeground: 'oklch(0.15 0.01 240)',
    sidebarPrimary: 'oklch(0.55 0.18 240)',
    sidebarPrimaryForeground: 'oklch(0.99 0.002 240)',
    sidebarAccent: 'oklch(0.92 0.01 240)',
    sidebarAccentForeground: 'oklch(0.15 0.01 240)',
    sidebarBorder: 'oklch(0.88 0.01 240)',
    sidebarRing: 'oklch(0.55 0.18 240)',
    
    // Scrollbar colors
    scrollbarTrack: 'oklch(0.94 0.005 240)',
    scrollbarThumb: 'oklch(0.78 0.01 240)',
    scrollbarThumbHover: 'oklch(0.68 0.01 240)',
    scrollbarThumbActive: 'oklch(0.58 0.01 240)',
  },
};
