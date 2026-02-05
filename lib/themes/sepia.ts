/**
 * Sepia Theme Definition
 * 
 * A warm, paper-like theme that's easy on the eyes.
 * Perfect for extended reading sessions.
 */

import type { Theme } from './types';

export const sepiaTheme: Theme = {
  id: 'sepia',
  name: 'Sepia',
  description: 'Warm, paper-like theme for comfortable reading',
  icon: 'BookOpen',
  colors: {
    // Core colors - warm beige/cream tones
    background: 'oklch(0.94 0.02 80)',
    foreground: 'oklch(0.25 0.03 50)',
    
    // Card colors
    card: 'oklch(0.96 0.018 75)',
    cardForeground: 'oklch(0.25 0.03 50)',
    
    // Popover colors
    popover: 'oklch(0.96 0.018 75)',
    popoverForeground: 'oklch(0.25 0.03 50)',
    
    // Primary accent colors (warm brown/amber)
    primary: 'oklch(0.55 0.12 55)',
    primaryForeground: 'oklch(0.96 0.018 75)',
    
    // Secondary colors
    secondary: 'oklch(0.90 0.025 75)',
    secondaryForeground: 'oklch(0.30 0.03 50)',
    
    // Muted colors
    muted: 'oklch(0.88 0.025 78)',
    mutedForeground: 'oklch(0.45 0.03 55)',
    
    // Accent colors
    accent: 'oklch(0.55 0.12 55)',
    accentForeground: 'oklch(0.96 0.018 75)',
    
    // Destructive colors
    destructive: 'oklch(0.55 0.2 25)',
    destructiveForeground: 'oklch(0.96 0.018 75)',
    
    // Border and input
    border: 'oklch(0.82 0.03 70)',
    input: 'oklch(0.92 0.02 78)',
    ring: 'oklch(0.55 0.12 55)',
    
    // Chart colors
    chart1: 'oklch(0.55 0.12 55)',
    chart2: 'oklch(0.5 0.1 120)',
    chart3: 'oklch(0.45 0.08 200)',
    chart4: 'oklch(0.65 0.15 80)',
    chart5: 'oklch(0.55 0.15 30)',
    
    // Sidebar colors
    sidebar: 'oklch(0.92 0.022 78)',
    sidebarForeground: 'oklch(0.25 0.03 50)',
    sidebarPrimary: 'oklch(0.55 0.12 55)',
    sidebarPrimaryForeground: 'oklch(0.96 0.018 75)',
    sidebarAccent: 'oklch(0.88 0.028 75)',
    sidebarAccentForeground: 'oklch(0.25 0.03 50)',
    sidebarBorder: 'oklch(0.82 0.03 70)',
    sidebarRing: 'oklch(0.55 0.12 55)',
    
    // Scrollbar colors
    scrollbarTrack: 'oklch(0.90 0.02 78)',
    scrollbarThumb: 'oklch(0.72 0.04 65)',
    scrollbarThumbHover: 'oklch(0.62 0.05 60)',
    scrollbarThumbActive: 'oklch(0.52 0.06 55)',
  },
};
