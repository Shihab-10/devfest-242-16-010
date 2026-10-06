import React from 'react';
import { Check, FileText, Upload, ListChecks, Package } from 'lucide-react';
import { Language } from '../types/tender';
import { translations } from '../i18n/translations';

interface WorkflowStepsProps {
  language: Language;
  hasRequirements: boolean;
  uploadedCount: number;
  matchedCount: number;
  isPackageReady: boolean;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  language,
  hasRequirements,
  uploadedCount,
  matchedCount,
  isPackageReady,
}) => {
  const t = translations[language];

  const steps = [
    {
      id: 1,
      title: t.step1,
      isDone: hasRequirements,
      isActive: !hasRequirements,
      icon: FileText,
    },
    {
      id: 2,
      title: t.step2,
      isDone: uploadedCount > 0,
      isActive: hasRequirements && uploadedCount === 0,
      icon: Upload,
    },
    {
      id: 3,
      title: t.step3,
      isDone: matchedCount > 0,
      isActive: uploadedCount > 0 && !isPackageReady,
      icon: ListChecks,
    },
    {
      id: 4,
      title: t.step4,
      isDone: isPackageReady,
      isActive: isPackageReady,
      icon: Package,
    },
  ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                step.isDone
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : step.isActive
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  step.isDone
                    ? 'bg-emerald-600 text-white'
                    : step.isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold block truncate">
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
