import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  HelpCircle,
  Calendar,
  Lock,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Language,
  UploadedFileItem,
  EvaluatedRequirement,
  DocumentStatus,
  DuplicateGroup,
} from '../types/tender';
import { translations } from '../i18n/translations';

interface MatchingChecklistProps {
  language: Language;
  evaluatedList: EvaluatedRequirement[];
  uploadedFiles: UploadedFileItem[];
  duplicateGroups: Map<string, DuplicateGroup>;
  matches: Record<string, string>; // reqId -> fileId
  expiryDates: Record<string, string>; // reqId -> YYYY-MM-DD
  submissionDeadline: string;
  duplicateConflictWarnings: string[];
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryChange: (requirementId: string, expiryDate: string) => void;
}

export const MatchingChecklist: React.FC<MatchingChecklistProps> = ({
  language,
  evaluatedList,
  uploadedFiles,
  duplicateGroups,
  matches,
  expiryDates,
  submissionDeadline,
  duplicateConflictWarnings,
  onMatchChange,
  onExpiryChange,
}) => {
  const t = translations[language];

  // Inverted map: fileId -> reqId (which file is currently assigned to which requirement)
  const fileToReqMap = new Map<string, string>();
  for (const [reqId, fileId] of Object.entries(matches)) {
    if (fileId) {
      fileToReqMap.set(fileId, reqId);
    }
  }

  // Set of matched file hashes
  const matchedHashes = new Set<string>();
  for (const [, fileId] of Object.entries(matches)) {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file && file.sha256) {
      matchedHashes.add(file.sha256);
    }
  }

  const renderStatusBadge = (status: DocumentStatus, isBlocking: boolean) => {
    switch (status) {
      case 'OK':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.statusOk}</span>
          </div>
        );
      case 'Missing':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t.statusMissing}</span>
            {isBlocking && (
              <span className="text-[10px] font-semibold uppercase bg-rose-200 dark:bg-rose-900 px-1 rounded">
                Block
              </span>
            )}
          </div>
        );
      case 'Expiry date needed':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.statusExpiryNeeded}</span>
            {isBlocking && (
              <span className="text-[10px] font-semibold uppercase bg-amber-200 dark:bg-amber-900 px-1 rounded">
                Block
              </span>
            )}
          </div>
        );
      case 'Expired':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>{t.statusExpired}</span>
            {isBlocking && (
              <span className="text-[10px] font-semibold uppercase bg-red-200 dark:bg-red-900 px-1 rounded">
                Block
              </span>
            )}
          </div>
        );
      case 'Not provided':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.statusNotProvided}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const matchedItemsCount = evaluatedList.filter((e) => e.matchedFile !== null).length;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.checklistSectionTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.matchedCount}: {matchedItemsCount} / {evaluatedList.length}{' '}
              {language === 'en' ? 'requirements' : 'চাহিদা'} •{' '}
              {t.submissionDeadline}:{' '}
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {submissionDeadline}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3 text-indigo-500" />
            <span>1-to-1 Match Enforced</span>
          </span>
        </div>
      </div>

      {duplicateConflictWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Exact Binary Duplicate Conflict:</span>
          </div>
          {duplicateConflictWarnings.map((warn, i) => (
            <p key={i} className="pl-5">
              • {warn}
            </p>
          ))}
        </div>
      )}

      {/* Checklist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 sm:px-4 w-12 text-center">{t.colOrder}</th>
              <th className="py-3 px-3 sm:px-4 min-w-[220px]">{t.colDocument}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.colType}</th>
              <th className="py-3 px-3 sm:px-4 min-w-[200px]">{t.colMatchedFile}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.colPages}</th>
              <th className="py-3 px-3 sm:px-4 min-w-[150px]">{t.colExpiryDate}</th>
              <th className="py-3 px-3 sm:px-4 min-w-[130px]">{t.colStatus}</th>
              <th className="py-3 px-2 sm:px-3 text-center">{t.colActions}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
            {evaluatedList.map((item) => {
              const req = item.requirement;
              const matchedFile = item.matchedFile;
              const title = language === 'bn' ? req.title_bn || req.title_en : req.title_en;
              const expiryValue = expiryDates[req.id] || '';

              return (
                <tr
                  key={req.id}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                    item.isBlocking
                      ? 'bg-rose-50/20 dark:bg-rose-950/10'
                      : item.status === 'OK'
                      ? 'bg-emerald-50/10 dark:bg-emerald-950/5'
                      : ''
                  }`}
                >
                  {/* Order */}
                  <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                    {req.order}
                  </td>

                  {/* Document Name & Badges */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {req.has_expiry && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{t.expiryRequired}</span>
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {req.id}
                      </span>
                    </div>
                  </td>

                  {/* Mandatory / Optional */}
                  <td className="py-3.5 px-2 sm:px-3 text-center">
                    {req.mandatory ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        {t.mandatory}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {t.optional}
                      </span>
                    )}
                  </td>

                  {/* Matched File Dropdown */}
                  <td className="py-3.5 px-3 sm:px-4">
                    <div className="relative">
                      <select
                        value={matchedFile?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          onMatchChange(req.id, val ? val : null);
                        }}
                        disabled={uploadedFiles.length === 0}
                        className={`w-full text-xs font-medium rounded-lg border py-1.5 px-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${
                          matchedFile
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <option value="">
                          {uploadedFiles.length === 0 ? t.noFilesToMatch : t.selectFilePlaceholder}
                        </option>
                        {uploadedFiles.map((file) => {
                          const isAssignedToOther =
                            fileToReqMap.has(file.id) && fileToReqMap.get(file.id) !== req.id;
                          const otherReqId = fileToReqMap.get(file.id);
                          const otherReq = evaluatedList.find((e) => e.requirement.id === otherReqId)?.requirement;
                          const isDupGroup = duplicateGroups.has(file.sha256);

                          // Check if another duplicate of this file is already matched elsewhere
                          const isDuplicateAlreadyMatched =
                            isDupGroup &&
                            matchedHashes.has(file.sha256) &&
                            matchedFile?.sha256 !== file.sha256;

                          let label = `${file.name} (${file.pageCount ?? '?'} pgs)`;
                          if (isAssignedToOther) {
                            label += ` — [Reassign from #${otherReq?.order ?? otherReqId}]`;
                          } else if (isDuplicateAlreadyMatched) {
                            label += ` — [Duplicate of already matched file]`;
                          }

                          return (
                            <option
                              key={file.id}
                              value={file.id}
                              disabled={isDuplicateAlreadyMatched}
                            >
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </td>

                  {/* Page Count */}
                  <td className="py-3.5 px-2 sm:px-3 text-center">
                    {matchedFile ? (
                      <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400">
                        {matchedFile.pageCount ?? '-'}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Expiry Date Input (when applicable) */}
                  <td className="py-3.5 px-3 sm:px-4">
                    {req.has_expiry ? (
                      <div className="space-y-1">
                        <input
                          type="date"
                          value={expiryValue}
                          disabled={!matchedFile}
                          onChange={(e) => onExpiryChange(req.id, e.target.value)}
                          className={`text-xs font-mono rounded-lg border py-1 px-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${
                            !matchedFile
                              ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                              : !expiryValue
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                              : expiryValue < submissionDeadline
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                          }`}
                        />
                        {matchedFile && !expiryValue && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                            Required (Deadline: {submissionDeadline})
                          </span>
                        )}
                        {matchedFile && expiryValue && expiryValue < submissionDeadline && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-semibold">
                            Expired before {submissionDeadline}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">N/A</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 sm:px-4">
                    {renderStatusBadge(item.status, item.isBlocking)}
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.statusReason}
                    </span>
                  </td>

                  {/* Actions (Unmatch) */}
                  <td className="py-3.5 px-2 sm:px-3 text-center">
                    {matchedFile ? (
                      <button
                        type="button"
                        onClick={() => onMatchChange(req.id, null)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title={t.clearMatch}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.clearMatch}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
