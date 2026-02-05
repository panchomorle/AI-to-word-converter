'use client';

/**
 * Theme Switcher Component
 * 
 * An intuitive dropdown-based theme switcher that displays available themes
 * with icons and descriptions. Perfect for header integration.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, BookOpen, ChevronDown, Check, Palette } from 'lucide-react';
import { useTheme } from '@/components/app-theme-provider';
import { Button } from '@/components/ui/button';
import type { ThemeId } from '@/lib/themes/types';

/**
 * Get icon component for a theme
 */
function getThemeIcon(themeId: ThemeId, className?: string) {
  const iconProps = { className: className || 'w-4 h-4' };
  
  switch (themeId) {
    case 'dark':
      return <Moon {...iconProps} />;
    case 'light':
      return <Sun {...iconProps} />;
    case 'sepia':
      return <BookOpen {...iconProps} />;
    default:
      return <Palette {...iconProps} />;
  }
}

/**
 * Theme Switcher Props
 */
interface ThemeSwitcherProps {
  /** Additional CSS classes */
  className?: string;
  /** Show label next to icon */
  showLabel?: boolean;
}

/**
 * Theme Switcher Component
 */
export function ThemeSwitcher({ className = '', showLabel = false }: ThemeSwitcherProps) {
  const { theme, themeId, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  const handleThemeSelect = (newThemeId: ThemeId) => {
    setTheme(newThemeId);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size={showLabel ? 'default' : 'icon'}
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-2 ${showLabel ? 'px-3' : 'h-9 w-9'}`}
        title={`Theme: ${theme.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {getThemeIcon(themeId)}
        {showLabel && (
          <>
            <span className="text-sm">{theme.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          role="listbox"
          aria-label="Select theme"
        >
          <div className="p-1.5">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Choose Theme
            </div>
            
            {availableThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeSelect(t.id as ThemeId)}
                className={`
                  w-full flex items-start gap-3 px-2 py-2.5 rounded-md text-left
                  transition-colors duration-150
                  ${themeId === t.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-secondary text-foreground'
                  }
                `}
                role="option"
                aria-selected={themeId === t.id}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-md shrink-0
                  ${themeId === t.id ? 'bg-primary/20' : 'bg-secondary'}
                `}>
                  {getThemeIcon(t.id as ThemeId)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{t.name}</span>
                    {themeId === t.id && (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {t.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Theme Toggle
 * 
 * A simpler theme toggle that cycles through themes.
 * Useful for mobile or space-constrained layouts.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { themeId, setTheme, availableThemes } = useTheme();
  
  const cycleTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.id === themeId);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex].id as ThemeId);
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className={`h-9 w-9 ${className}`}
      title={`Current theme: ${themeId}. Click to switch.`}
    >
      {getThemeIcon(themeId)}
    </Button>
  );
}
