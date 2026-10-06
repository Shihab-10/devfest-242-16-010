import React from 'react';
import { ShieldCheck, ExternalLink, Github, Globe } from 'lucide-react';
import { Language } from '../types/tender';
import { translations } from '../i18n/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t.participantName}
              </span>
              <span className="mx-2">•</span>
              <span>{t.participantReg}</span>
              <span className="mx-2">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {t.badgeDevfest}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {t.browserOnlyNote}
            </span>

            <a
              href="https://github.com/Shihab-10/devfest-242-16-010"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href="https://devfest-242-16-010.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
