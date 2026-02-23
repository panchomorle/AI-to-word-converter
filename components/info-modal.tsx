"use client";

import { X, Copy, FileDown, Settings2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-provider";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-xl font-semibold text-foreground">
            {t.infoModalTitle}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Intro */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>MDWord</strong> {t.infoModalIntro.replace('MDWord ', '')}
            </p>
          </div>

          {/* Step 1: Copy correctly */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              {t.step1Title}
            </h3>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  {t.step1Warning}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-400">{t.step1Incorrect}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.step1IncorrectDesc}
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-400">{t.step1Correct}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.step1CorrectDesc} <Copy className="w-3 h-3 inline mx-1" />
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Select source */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              {t.step2Title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t.step2Desc}
            </p>
            <div className="space-y-2">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Gemini</span>
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded text-primary">$$formula$$</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.step2GeminiDesc}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">ChatGPT</span>
                  <code className="text-xs bg-secondary px-2 py-0.5 rounded text-primary">[formula]</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.step2ChatGPTDesc}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              {t.step2Tip}
            </p>
          </section>

          {/* Step 3: Paste and generate */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              {t.step3Title}
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>{t.step3Desc1}</li>
              <li>{t.step3Desc2}</li>
              <li>
                <Settings2 className="w-3 h-3 inline mx-1" /> {t.step3Desc3}
              </li>
              <li>
                <FileDown className="w-3 h-3 inline mx-1" /> {t.step3Desc4}
              </li>
            </ol>
          </section>

          {/* Tips */}
          <section className="bg-secondary/30 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-2">{t.tipsTitle}</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• {t.tip1}</li>
              <li>• {t.tip2}</li>
              <li>• {t.tip3}</li>
              <li>• {t.tip4}</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30">
          <Button onClick={onClose} className="w-full">
            {t.gotIt}
          </Button>
        </div>
      </div>
    </div>
  );
}
