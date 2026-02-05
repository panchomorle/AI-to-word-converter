/**
 * Dark Theme Definition
 * 
 * This is the default theme, extracted from the original color scheme.
 * Features a dark background with cyan/teal accent colors.
 */

import type { Theme } from './types';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Dark theme with cyan accents - easy on the eyes',
  icon: 'Moon',
  colors: {
    // Core colors
    background: 'oklch(0.12 0.01 240)',
    foreground: 'oklch(0.95 0.01 240)',
    
    // Card colors
    card: 'oklch(0.16 0.01 240)',
    cardForeground: 'oklch(0.95 0.01 240)',
    
    // Popover colors
    popover: 'oklch(0.16 0.01 240)',
    popoverForeground: 'oklch(0.95 0.01 240)',
    
    // Primary accent colors (cyan/teal)
    primary: 'oklch(0.75 0.15 180)',
    primaryForeground: 'oklch(0.12 0.01 240)',
    
    // Secondary colors
    secondary: 'oklch(0.22 0.01 240)',
    secondaryForeground: 'oklch(0.85 0.01 240)',
    
    // Muted colors
    muted: 'oklch(0.22 0.01 240)',
    mutedForeground: 'oklch(0.65 0.01 240)',
    
    // Accent colors
    accent: 'oklch(0.75 0.15 180)',
    accentForeground: 'oklch(0.12 0.01 240)',
    
    // Destructive colors
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.95 0.01 240)',
    
    // Border and input
    border: 'oklch(0.28 0.01 240)',
    input: 'oklch(0.20 0.01 240)',
    ring: 'oklch(0.75 0.15 180)',
    
    // Chart colors
    chart1: 'oklch(0.75 0.15 180)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    
    // Sidebar colors
    sidebar: 'oklch(0.14 0.01 240)',
    sidebarForeground: 'oklch(0.95 0.01 240)',
    sidebarPrimary: 'oklch(0.75 0.15 180)',
    sidebarPrimaryForeground: 'oklch(0.12 0.01 240)',
    sidebarAccent: 'oklch(0.22 0.01 240)',
    sidebarAccentForeground: 'oklch(0.95 0.01 240)',
    sidebarBorder: 'oklch(0.28 0.01 240)',
    sidebarRing: 'oklch(0.75 0.15 180)',
    
    // Scrollbar colors
    scrollbarTrack: 'oklch(0.16 0.01 240)',
    scrollbarThumb: 'oklch(0.35 0.01 240)',
    scrollbarThumbHover: 'oklch(0.45 0.01 240)',
    scrollbarThumbActive: 'oklch(0.55 0.01 240)',
  },
};
