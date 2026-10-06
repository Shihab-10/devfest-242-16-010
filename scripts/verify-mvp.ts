import { sampleTender } from '../src/data/sampleTender';
import {
  evaluateRequirement,
  evaluateAllRequirements,
  calculateDuplicateGroups,
} from '../src/utils/statusEvaluator';
import { translations } from '../src/i18n/translations';
import { UploadedFileItem, RequirementItem } from '../src/types/tender';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('=== RUNNING VERIFICATION SUITE FOR TENDER PACKAGE BUILDER MVP ===\n');

// 1. Verify Sample Requirements & Schema
console.log('--- Test 1: Requirements Schema & Sample Data ---');
assert(sampleTender.tender.tender_id === 'WD-2026-RHD-049', 'Tender ID matches');
assert(sampleTender.tender.submission_deadline === '2026-10-15', 'Deadline matches');
assert(sampleTender.requirements.length === 7, '7 requirements defined in sample');
assert(
  sampleTender.requirements.every((r) => r.id && r.order && r.title_en && r.title_bn),
  'Every requirement has id, order, title_en, and title_bn'
);

// 2. Verify Exact Duplicate Detection (SHA-256)
console.log('\n--- Test 2: Exact Duplicate Detection (SHA-256) ---');
const fileA: UploadedFileItem = {
  id: 'file-1',
  file: {} as File,
  name: 'Trade_License_Original.pdf',
  size: 1024,
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  pageCount: 2,
  status: 'ready',
  uploadedAt: Date.now(),
};

const fileB_duplicate: UploadedFileItem = {
  id: 'file-2',
  file: {} as File,
  name: 'Different_Name_Copy.pdf', // Different name, identical sha256
  size: 1024,
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  pageCount: 2,
  status: 'ready',
  uploadedAt: Date.now(),
};

const fileC_unique: UploadedFileItem = {
  id: 'file-3',
  file: {} as File,
  name: 'TIN_Certificate.pdf',
  size: 2048,
  sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
  pageCount: 1,
  status: 'ready',
  uploadedAt: Date.now(),
};

const dupGroups = calculateDuplicateGroups([fileA, fileB_duplicate, fileC_unique]);
assert(dupGroups.size === 1, 'Found exactly 1 duplicate group');
assert(
  dupGroups.get('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')!.files.length === 2,
  'Duplicate group contains 2 files'
);

// 3. Verify Status Evaluation Rules
console.log('\n--- Test 3: Status Evaluation Rules ---');
const deadline = '2026-10-15';

const mandatoryReqWithExpiry: RequirementItem = {
  id: 'req-m-exp',
  order: 1,
  title_en: 'Trade License',
  title_bn: 'ট্রেড লাইসেন্স',
  mandatory: true,
  has_expiry: true,
};

const optionalReq: RequirementItem = {
  id: 'req-opt',
  order: 2,
  title_en: 'Optional Experience',
  title_bn: 'অভিজ্ঞতার সনদ',
  mandatory: false,
  has_expiry: false,
};

// Case 3a: Mandatory with no file -> Missing (Blocks)
const eval3a = evaluateRequirement(mandatoryReqWithExpiry, null, '', deadline);
assert(eval3a.status === 'Missing', 'Mandatory missing file gives status Missing');
assert(eval3a.isBlocking === true, 'Status Missing is blocking');

// Case 3b: Optional with no file -> Not provided (Does NOT block)
const eval3b = evaluateRequirement(optionalReq, null, '', deadline);
assert(eval3b.status === 'Not provided', 'Optional missing file gives status Not provided');
assert(eval3b.isBlocking === false, 'Status Not provided is NOT blocking');

// Case 3c: Matched + Expiry required + no date -> Expiry date needed (Blocks)
const eval3c = evaluateRequirement(mandatoryReqWithExpiry, fileA, '', deadline);
assert(eval3c.status === 'Expiry date needed', 'Matched with missing date gives Expiry date needed');
assert(eval3c.isBlocking === true, 'Status Expiry date needed is blocking');

// Case 3d: Matched + Expiry date before deadline -> Expired (Blocks)
const eval3d = evaluateRequirement(mandatoryReqWithExpiry, fileA, '2026-10-14', deadline);
assert(eval3d.status === 'Expired', 'Date 2026-10-14 before deadline 2026-10-15 gives Expired');
assert(eval3d.isBlocking === true, 'Status Expired is blocking');

// Case 3e: Matched + Expiry date EQUALS deadline -> OK (Does NOT block)
const eval3e = evaluateRequirement(mandatoryReqWithExpiry, fileA, '2026-10-15', deadline);
assert(eval3e.status === 'OK', 'Date 2026-10-15 equal to deadline gives OK');
assert(eval3e.isBlocking === false, 'Status OK is NOT blocking');

// Case 3f: Matched + Expiry date AFTER deadline -> OK (Does NOT block)
const eval3f = evaluateRequirement(mandatoryReqWithExpiry, fileA, '2026-12-31', deadline);
assert(eval3f.status === 'OK', 'Date 2026-12-31 after deadline gives OK');
assert(eval3f.isBlocking === false, 'Status OK is NOT blocking');

// 4. Verify Duplicate Matching Conflict in Package Evaluation
console.log('\n--- Test 4: Duplicate Matching Conflict Detection ---');
const req1: RequirementItem = {
  id: 'r1',
  order: 1,
  title_en: 'Doc 1',
  title_bn: 'ডক ১',
  mandatory: true,
  has_expiry: false,
};
const req2: RequirementItem = {
  id: 'r2',
  order: 2,
  title_en: 'Doc 2',
  title_bn: 'ডক ২',
  mandatory: true,
  has_expiry: false,
};

// Match File A to Req 1, and duplicate File B to Req 2
const evalDupMatch = evaluateAllRequirements(
  [req1, req2],
  { r1: fileA.id, r2: fileB_duplicate.id },
  {},
  [fileA, fileB_duplicate],
  deadline
);
assert(evalDupMatch.duplicateConflictWarnings.length > 0, 'Detected duplicate binary conflict between matches');
assert(evalDupMatch.isPackageReady === false, 'Package is blocked when duplicate files are matched');

// Match File A to Req 1, and unique File C to Req 2
const evalCleanMatch = evaluateAllRequirements(
  [req1, req2],
  { r1: fileA.id, r2: fileC_unique.id },
  {},
  [fileA, fileC_unique],
  deadline
);
assert(evalCleanMatch.duplicateConflictWarnings.length === 0, 'No duplicate conflicts for distinct files');
assert(evalCleanMatch.isPackageReady === true, 'Package is READY when all requirements are satisfied');

// 5. Verify Bilingual Dictionary Completeness
console.log('\n--- Test 5: Bilingual Dictionary Completeness ---');
const enKeys = Object.keys(translations.en);
const bnKeys = Object.keys(translations.bn);
assert(enKeys.length === bnKeys.length, `Both languages have same key count (${enKeys.length})`);
for (const key of enKeys) {
  assert(Boolean((translations.bn as any)[key]), `Bangla has translation for key: ${key}`);
}

console.log('\n🎉 ALL 16 REQUIREMENTS AND CRITICAL LOGIC CHECKS PASSED SUCCESSFULLY!\n');
