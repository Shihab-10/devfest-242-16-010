import React, { useState } from 'react';
import {
  PackageCheck,
  AlertOctagon,
  FileDown,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Language, EvaluatedRequirement, TenderMetadata } from '../types/tender';
import { translations } from '../i18n/translations';

interface PackageSummaryProps {
  language: Language;
  tender: TenderMetadata | null;
  evaluatedList: EvaluatedRequirement[];
  blockingIssues: string[];
  isPackageReady: boolean;
  onGeneratePackage: () => void;
}

export const PackageSummary: React.FC<PackageSummaryProps> = ({
  language,
  tender,
  evaluatedList,
  blockingIssues,
  isPackageReady,
  onGeneratePackage,
}) => {
  const t = translations[language];
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalPages = evaluatedList.reduce((acc, curr) => {
    return acc + (curr.matchedFile?.pageCount || 0);
  }, 0);

  const compliantCount = evaluatedList.filter((e) => e.status === 'OK').length;
  const optionalOmittedCount = evaluatedList.filter((e) => e.status === 'Not provided').length;

  const handleGenerateClick = () => {
    if (!isPackageReady) return;
    setShowSuccessModal(true);
    onGeneratePackage();
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.summaryTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPackageReady
                ? `${compliantCount} ${language === 'en' ? 'compliant documents verified' : 'নথি যাচাইকৃত ও প্রস্তুত'}`
                : `${blockingIssues.length} ${language === 'en' ? 'blocking issues preventing package compilation' : 'টি সমস্যা প্যাকেজ তৈরিতে বাধা দিচ্ছে'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {totalPages} {t.pages} {language === 'en' ? 'compiled' : 'মোট'}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* State Banner */}
        {isPackageReady ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                {t.packageReadyTitle}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                {t.packageReadyDesc}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  {compliantCount} {t.readyDocuments}
                </span>
                {optionalOmittedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {optionalOmittedCount} {t.statusNotProvided}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                  {totalPages} {language === 'en' ? 'Total PDF Pages' : 'সর্বমোট পৃষ্ঠা'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <h4 className="font-bold text-sm text-rose-950 dark:text-rose-100">
                  {t.packageBlockedTitle} ({blockingIssues.length})
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  {t.packageBlockedDesc}
                </p>
              </div>

              {/* Blocking issues list */}
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-1.5 max-h-48 overflow-y-auto">
                {blockingIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5 font-medium"
                  >
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button & Notes */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {language === 'en'
                ? 'Output filename:'
                : 'তৈরিকৃত প্যাকেজের নাম:'}{' '}
              <code className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {tender?.tender_id ? `${tender.tender_id}_Package.pdf` : '<tender_id>_Package.pdf'}
              </code>
            </span>
          </div>

          <button
            type="button"
            disabled={!isPackageReady}
            onClick={handleGenerateClick}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              isPackageReady
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none border border-slate-300 dark:border-slate-700'
            }`}
            title={
              isPackageReady
                ? 'Generate and download tender package'
                : `Blocked by ${blockingIssues.length} unresolved issue(s)`
            }
          >
            <FileDown className="w-4 h-4" />
            <span>{t.generatePackageBtn}</span>
          </button>
        </div>
      </div>

      {/* Success Modal / Readiness Confirmation */}
      {showSuccessModal && tender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tender Package Verification Succeeded
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready for compilation: {tender.tender_id}_Package.pdf
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Tender ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {tender.tender_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Procuring Entity:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[220px]">
                  {tender.procuring_entity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bidder:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[220px]">
                  {tender.bidder}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Compliant Documents:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {compliantCount} documents ({totalPages} pages)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              All compliance rules passed. Mandatory documents are verified, valid expiry dates confirmed, and duplicate conflicts resolved.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
