"use client";

import { useLanguage } from './language-provider';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const { language, setLanguage, languageInfo, supportedLanguages } = useLanguage();
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-2 px-3"
        title="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{languageInfo.nativeName}</span>
        <span className="sm:hidden">{language.toUpperCase()}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/80 transition-colors flex items-center justify-between ${
                language === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
              }`}
              dir={lang.dir}
            >
              <span>{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
