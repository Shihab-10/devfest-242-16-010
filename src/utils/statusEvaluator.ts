import {
  RequirementItem,
  UploadedFileItem,
  EvaluatedRequirement,
  DuplicateGroup,
} from '../types/tender';

/**
 * Calculates duplicate groups from uploaded files based on SHA-256 hash.
 */
export function calculateDuplicateGroups(files: UploadedFileItem[]): Map<string, DuplicateGroup> {
  const groups = new Map<string, DuplicateGroup>();

  for (const file of files) {
    if (!file.sha256) continue;
    const existing = groups.get(file.sha256);
    if (existing) {
      existing.files.push(file);
    } else {
      groups.set(file.sha256, {
        hash: file.sha256,
        files: [file],
      });
    }
  }

  // Filter only groups with > 1 file
  const duplicateOnly = new Map<string, DuplicateGroup>();
  for (const [hash, group] of groups.entries()) {
    if (group.files.length > 1) {
      duplicateOnly.set(hash, group);
    }
  }
  return duplicateOnly;
}

/**
 * Evaluates a single requirement based on matched file, expiry date, and submission deadline.
 *
 * Rules:
 * - Missing: Mandatory requirement has no file matched (Blocks package)
 * - Not provided: Optional requirement has no matched file (Does NOT block)
 * - Expiry date needed: has_expiry = true, file matched, no expiry date entered (Blocks package)
 * - Expired: Expiry date is strictly before submission deadline (Blocks package)
 * - OK: File matched, and (if has_expiry) expiry date is on or after submission deadline (Does NOT block)
 *   (Note: If expiry date equals submission deadline, status is OK)
 */
export function evaluateRequirement(
  requirement: RequirementItem,
  matchedFile: UploadedFileItem | null,
  expiryDate: string, // YYYY-MM-DD
  submissionDeadline: string // YYYY-MM-DD
): EvaluatedRequirement {
  // Case 1: No file matched
  if (!matchedFile) {
    if (requirement.mandatory) {
      return {
        requirement,
        matchedFile: null,
        expiryDate: '',
        status: 'Missing',
        isBlocking: true,
        statusReason: 'Mandatory requirement is missing a matched PDF document',
      };
    } else {
      return {
        requirement,
        matchedFile: null,
        expiryDate: '',
        status: 'Not provided',
        isBlocking: false,
        statusReason: 'Optional document not provided (allowed)',
      };
    }
  }

  // Case 2: File is matched, check expiry if applicable
  if (requirement.has_expiry) {
    if (!expiryDate || expiryDate.trim() === '') {
      return {
        requirement,
        matchedFile,
        expiryDate: '',
        status: 'Expiry date needed',
        isBlocking: true,
        statusReason: 'Document requires an expiry date to be specified',
      };
    }

    // Compare dates (YYYY-MM-DD format can be compared lexicographically or with Date)
    const expiryNorm = expiryDate.trim();
    const deadlineNorm = submissionDeadline.trim();

    if (expiryNorm < deadlineNorm) {
      return {
        requirement,
        matchedFile,
        expiryDate,
        status: 'Expired',
        isBlocking: true,
        statusReason: `Expired on ${expiryNorm}. Must be valid on or after deadline (${deadlineNorm})`,
      };
    }
  }

  // Case 3: Compliant / OK
  return {
    requirement,
    matchedFile,
    expiryDate,
    status: 'OK',
    isBlocking: false,
    statusReason: 'Document matched and verified compliant',
  };
}

/**
 * Validates whether the package is blocked by any requirement or duplicate conflict.
 */
export function evaluateAllRequirements(
  requirements: RequirementItem[],
  matches: Record<string, string>, // requirementId -> fileId
  expiryDates: Record<string, string>, // requirementId -> YYYY-MM-DD
  files: UploadedFileItem[],
  submissionDeadline: string
): {
  evaluatedList: EvaluatedRequirement[];
  blockingIssues: string[];
  isPackageReady: boolean;
  duplicateConflictWarnings: string[];
} {
  const fileMap = new Map<string, UploadedFileItem>(files.map(f => [f.id, f]));
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  const evaluatedList: EvaluatedRequirement[] = [];
  const blockingIssues: string[] = [];
  const duplicateConflictWarnings: string[] = [];

  // Track matched file hashes to prevent matching duplicate files to different requirements
  const matchedHashes = new Map<string, { reqId: string; fileName: string; reqTitle: string }>();

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    const file = fileId ? fileMap.get(fileId) || null : null;
    const expiry = expiryDates[req.id] || '';

    const evaluation = evaluateRequirement(req, file, expiry, submissionDeadline);
    evaluatedList.push(evaluation);

    if (evaluation.isBlocking) {
      blockingIssues.push(`[#${req.order} ${req.title_en}]: ${evaluation.status} — ${evaluation.statusReason}`);
    }

    // Check duplicate content matched across requirements
    if (file && file.sha256) {
      const prevMatched = matchedHashes.get(file.sha256);
      if (prevMatched && prevMatched.reqId !== req.id) {
        const warning = `Duplicate content detected: "${file.name}" matched to #${req.order} shares identical SHA-256 binary hash with "${prevMatched.fileName}" matched to #${prevMatched.reqTitle}.`;
        duplicateConflictWarnings.push(warning);
        blockingIssues.push(`Duplicate file conflict: Identical binary PDF used for #${req.order} and #${prevMatched.reqTitle}`);
      } else {
        matchedHashes.set(file.sha256, {
          reqId: req.id,
          fileName: file.name,
          reqTitle: `${req.order} (${req.title_en})`,
        });
      }
    }
  }

  const isPackageReady = evaluatedList.length > 0 && blockingIssues.length === 0;

  return {
    evaluatedList,
    blockingIssues,
    isPackageReady,
    duplicateConflictWarnings,
  };
}
