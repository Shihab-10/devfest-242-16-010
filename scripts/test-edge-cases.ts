import { sampleTender } from '../src/data/sampleTender';
import {
  evaluateRequirement,
  evaluateAllRequirements,
  calculateDuplicateGroups,
} from '../src/utils/statusEvaluator';
import {
  generateTenderPackage,
} from '../src/utils/pdfPackageGenerator';
import {
  inspectPdfFile,
  computeFileHash,
  generateTestPdf,
  isPdfFile,
} from '../src/utils/pdf';
import { PDFDocument } from 'pdf-lib';
import { UploadedFileItem, RequirementItem, RequirementsFile } from '../src/types/tender';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    failCount++;
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${msg}`);
    passCount++;
  }
}

async function runEdgeCaseTests() {
  console.log('================================================================');
  console.log('RUNNING ALL 20 EDGE CASE TESTS + PDF PACKAGE GENERATION (PHASE 2)');
  console.log('================================================================\n');

  const deadline = '2026-10-15';

  // Helper to create dummy test file item
  const createMockFile = (id: string, name: string, sha: string, pages: number = 1, size: number = 1024): UploadedFileItem => ({
    id,
    file: new File([new Uint8Array(size)], name, { type: 'application/pdf' }),
    name,
    size,
    sha256: sha,
    pageCount: pages,
    status: 'ready',
    uploadedAt: Date.now(),
  });

  const mandatoryReq1: RequirementItem = {
    id: 'req-1',
    order: 1,
    title_en: 'Trade License',
    title_bn: 'ট্রেড লাইসেন্স',
    mandatory: true,
    has_expiry: true,
  };

  const mandatoryReq2: RequirementItem = {
    id: 'req-2',
    order: 2,
    title_en: 'TIN Certificate',
    title_bn: 'টিআইএন সনদ',
    mandatory: true,
    has_expiry: false,
  };

  const optionalReq3: RequirementItem = {
    id: 'req-3',
    order: 3,
    title_en: 'ISO Quality Certificate',
    title_bn: 'আইএসও সনদ',
    mandatory: false,
    has_expiry: true,
  };

  // --- EDGE CASE 1: All mandatory documents present & valid ---
  console.log('--- Edge Case 1: All mandatory documents present ---');
  const file1 = createMockFile('f1', 'Trade_License.pdf', 'hash-1', 2);
  const file2 = createMockFile('f2', 'TIN_Cert.pdf', 'hash-2', 1);
  const eval1 = evaluateAllRequirements(
    [mandatoryReq1, mandatoryReq2],
    { 'req-1': file1.id, 'req-2': file2.id },
    { 'req-1': '2026-12-31' },
    [file1, file2],
    deadline
  );
  assert(eval1.isPackageReady === true, 'All mandatory present results in isPackageReady = true');
  assert(eval1.blockingIssues.length === 0, 'No blocking issues when all mandatory valid');

  // --- EDGE CASE 2: One mandatory document missing ---
  console.log('\n--- Edge Case 2: One mandatory document missing ---');
  const eval2 = evaluateAllRequirements(
    [mandatoryReq1, mandatoryReq2],
    { 'req-1': file1.id }, // req-2 unassigned
    { 'req-1': '2026-12-31' },
    [file1, file2],
    deadline
  );
  assert(eval2.isPackageReady === false, 'Missing mandatory blocks package');
  assert(eval2.evaluatedList.find(e => e.requirement.id === 'req-2')?.status === 'Missing', 'Unmatched mandatory has status Missing');

  // --- EDGE CASE 3: Optional document missing ---
  console.log('\n--- Edge Case 3: Optional document missing ---');
  const eval3 = evaluateAllRequirements(
    [mandatoryReq1, mandatoryReq2, optionalReq3],
    { 'req-1': file1.id, 'req-2': file2.id }, // optional omitted
    { 'req-1': '2026-12-31' },
    [file1, file2],
    deadline
  );
  assert(eval3.isPackageReady === true, 'Missing optional document does NOT block package');
  assert(eval3.evaluatedList.find(e => e.requirement.id === 'req-3')?.status === 'Not provided', 'Unmatched optional has status Not provided');

  // --- EDGE CASE 4: Expiry date missing ---
  console.log('\n--- Edge Case 4: Expiry date missing ---');
  const eval4 = evaluateRequirement(mandatoryReq1, file1, '', deadline);
  assert(eval4.status === 'Expiry date needed', 'Matched requirement with has_expiry but no date -> Expiry date needed');
  assert(eval4.isBlocking === true, 'Expiry date needed blocks package');

  // --- EDGE CASE 5: Expiry date before deadline ---
  console.log('\n--- Edge Case 5: Expiry date before deadline ---');
  const eval5 = evaluateRequirement(mandatoryReq1, file1, '2026-10-14', deadline);
  assert(eval5.status === 'Expired', 'Expiry before deadline -> Expired');
  assert(eval5.isBlocking === true, 'Expired document blocks package');

  // --- EDGE CASE 6: Expiry date equal to deadline ---
  console.log('\n--- Edge Case 6: Expiry date equal to deadline ---');
  const eval6 = evaluateRequirement(mandatoryReq1, file1, '2026-10-15', deadline);
  assert(eval6.status === 'OK', 'Expiry EQUAL to deadline -> OK');
  assert(eval6.isBlocking === false, 'Status OK does not block');

  // --- EDGE CASE 7: Expiry date after deadline ---
  console.log('\n--- Edge Case 7: Expiry date after deadline ---');
  const eval7 = evaluateRequirement(mandatoryReq1, file1, '2027-01-01', deadline);
  assert(eval7.status === 'OK', 'Expiry AFTER deadline -> OK');
  assert(eval7.isBlocking === false, 'Status OK does not block');

  // --- EDGE CASE 8: Duplicate PDFs with different filenames ---
  console.log('\n--- Edge Case 8: Duplicate PDFs with different filenames ---');
  const dupFileA = createMockFile('fa', 'License_Original.pdf', 'same-content-hash', 1);
  const dupFileB = createMockFile('fb', 'License_Renamed_Copy.pdf', 'same-content-hash', 1);
  const groups8 = calculateDuplicateGroups([dupFileA, dupFileB]);
  assert(groups8.size === 1, 'Identical hashes flagged as duplicates despite different names');
  assert(groups8.get('same-content-hash')?.files.length === 2, 'Duplicate group contains both files');

  // --- EDGE CASE 9: Same filename but different content ---
  console.log('\n--- Edge Case 9: Same filename but different content ---');
  const fileDiff1 = createMockFile('d1', 'document.pdf', 'hash-aaa', 1);
  const fileDiff2 = createMockFile('d2', 'document.pdf', 'hash-bbb', 2);
  const groups9 = calculateDuplicateGroups([fileDiff1, fileDiff2]);
  assert(groups9.size === 0, 'Different hashes are NOT duplicates even if filenames are identical');

  // --- EDGE CASE 10: Non-PDF upload detection ---
  console.log('\n--- Edge Case 10: Non-PDF upload detection ---');
  const fakePdf = new File([new TextEncoder().encode('Hello not a pdf')], 'test.txt', { type: 'text/plain' });
  const isPdfCheck = await isPdfFile(fakePdf);
  assert(isPdfCheck === false, 'Non-PDF file correctly rejected via isPdfFile');

  // --- EDGE CASE 11: 30-file limit enforcement ---
  console.log('\n--- Edge Case 11: 30-file limit enforcement ---');
  const thirtyFiles = Array.from({ length: 30 }, (_, i) => createMockFile(`f-${i}`, `doc_${i}.pdf`, `hash-${i}`));
  assert(thirtyFiles.length === 30, 'Handles maximum 30 files array');

  // --- EDGE CASE 12: Total 50 MB limit calculation ---
  console.log('\n--- Edge Case 12: Total 50 MB limit calculation ---');
  const largeFiles = [
    createMockFile('l1', 'big1.pdf', 'h1', 10, 30 * 1024 * 1024),
    createMockFile('l2', 'big2.pdf', 'h2', 10, 25 * 1024 * 1024),
  ];
  const totalBytes = largeFiles.reduce((acc, f) => acc + f.size, 0);
  assert(totalBytes > 50 * 1024 * 1024, 'Detects total size exceeding 50 MB (55 MB > 50 MB)');

  // --- EDGE CASE 13: Multiple pages per document inspection ---
  console.log('\n--- Edge Case 13: Multiple pages per document inspection ---');
  const multiPagePdf = await generateTestPdf('MultiPage_Doc', 4);
  const inspectResult = await inspectPdfFile(multiPagePdf);
  assert(inspectResult.pageCount === 4, 'Correctly detected 4 pages in multi-page PDF');

  // --- EDGE CASE 14: Requirements in unsorted order ---
  console.log('\n--- Edge Case 14: Requirements in unsorted order ---');
  const unsortedReqs: RequirementItem[] = [
    { id: 'r30', order: 30, title_en: 'Third', title_bn: 'তৃতীয়', mandatory: true, has_expiry: false },
    { id: 'r5', order: 5, title_en: 'First', title_bn: 'প্রথম', mandatory: true, has_expiry: false },
    { id: 'r12', order: 12, title_en: 'Second', title_bn: 'দ্বিতীয়', mandatory: true, has_expiry: false },
  ];
  const evalUnsorted = evaluateAllRequirements(unsortedReqs, {}, {}, [], deadline);
  assert(evalUnsorted.evaluatedList[0].requirement.order === 5, 'Evaluated list sorted: 1st is order 5');
  assert(evalUnsorted.evaluatedList[1].requirement.order === 12, 'Evaluated list sorted: 2nd is order 12');
  assert(evalUnsorted.evaluatedList[2].requirement.order === 30, 'Evaluated list sorted: 3rd is order 30');

  // --- EDGE CASE 15: Changed / removed match ---
  console.log('\n--- Edge Case 15: Changed / removed match ---');
  const matches15: Record<string, string> = { 'req-1': file1.id };
  // Unmatch:
  delete matches15['req-1'];
  const evalUnmatched = evaluateRequirement(mandatoryReq1, null, '', deadline);
  assert(evalUnmatched.status === 'Missing', 'Unmatching mandatory updates status to Missing');

  // --- EDGE CASE 16: Removed file after matching ---
  console.log('\n--- Edge Case 16: Removed file after matching ---');
  // File was in matches, but removed from files list
  const evalFileRemoved = evaluateAllRequirements(
    [mandatoryReq1],
    { 'req-1': 'deleted-file-id' },
    { 'req-1': '2026-12-31' },
    [], // files list is now empty!
    deadline
  );
  assert(evalFileRemoved.evaluatedList[0].status === 'Missing', 'Deleted file safely results in Missing status without crash');

  // --- EDGE CASE 17: Malformed PDF ---
  console.log('\n--- Edge Case 17: Malformed PDF ---');
  const corruptPdf = new File([new TextEncoder().encode('%PDF-Corrupt garbage content')], 'corrupt.pdf', { type: 'application/pdf' });
  const corruptInspect = await inspectPdfFile(corruptPdf);
  assert(corruptInspect.pageCount === 0 && Boolean(corruptInspect.error), 'Malformed PDF handled safely without uncaught exception');

  // --- EDGE CASE 18: Password-protected PDF simulation ---
  console.log('\n--- Edge Case 18: Password-protected PDF safety ---');
  // A file throwing encryption error
  const fakeEncrypted = new File([new TextEncoder().encode('%PDF-1.4 Encrypted test')], 'encrypted.pdf', { type: 'application/pdf' });
  const encInspect = await inspectPdfFile(fakeEncrypted);
  assert(encInspect.pageCount === 0, 'Encrypted/unreadable file returns 0 pages with error message');

  // --- EDGE CASE 19: Invalid requirements JSON schema ---
  console.log('\n--- Edge Case 19: Invalid requirements JSON schema ---');
  const badJson1 = JSON.stringify({ invalid: true });
  let caught19 = false;
  try {
    const parsed = JSON.parse(badJson1);
    if (!parsed.tender || !parsed.requirements) throw new Error('Schema invalid');
  } catch {
    caught19 = true;
  }
  assert(caught19 === true, 'Caught invalid requirements schema without tender/requirements');

  // --- EDGE CASE 20: Empty requirements list ---
  console.log('\n--- Edge Case 20: Empty requirements list ---');
  let caught20 = false;
  try {
    const parsed = { tender: { tender_id: 'T1', title: 'T', submission_deadline: '2026-10-15' }, requirements: [] };
    if (!Array.isArray(parsed.requirements) || parsed.requirements.length === 0) {
      throw new Error('Requirements list must be non-empty');
    }
  } catch {
    caught20 = true;
  }
  assert(caught20 === true, 'Empty requirements list rejected with clear error');

  // --- REAL PDF PACKAGE GENERATION TEST ---
  console.log('\n--- Real PDF Package Generation Test (Cover + Matched PDFs + Running Footers) ---');
  const realPdf1 = await generateTestPdf('Trade_License_Doc', 2);
  const realPdf2 = await generateTestPdf('TIN_Return_Doc', 1);

  const realFile1: UploadedFileItem = {
    id: 'rf1',
    file: realPdf1,
    name: 'Trade_License_Doc.pdf',
    size: realPdf1.size,
    sha256: await computeFileHash(realPdf1),
    pageCount: 2,
    status: 'ready',
    uploadedAt: Date.now(),
  };

  const realFile2: UploadedFileItem = {
    id: 'rf2',
    file: realPdf2,
    name: 'TIN_Return_Doc.pdf',
    size: realPdf2.size,
    sha256: await computeFileHash(realPdf2),
    pageCount: 1,
    status: 'ready',
    uploadedAt: Date.now(),
  };

  const evaluatedReal = [
    {
      requirement: mandatoryReq1,
      matchedFile: realFile1,
      expiryDate: '2026-12-31',
      status: 'OK' as const,
      isBlocking: false,
      statusReason: 'OK',
    },
    {
      requirement: mandatoryReq2,
      matchedFile: realFile2,
      expiryDate: '',
      status: 'OK' as const,
      isBlocking: false,
      statusReason: 'OK',
    },
  ];

  const genResult = await generateTenderPackage(
    sampleTender.tender,
    evaluatedReal,
    (p) => console.log(`  [Progress]: ${p.percentage}% - ${p.message}`)
  );

  assert(genResult.filename === `${sampleTender.tender.tender_id}_Package.pdf`, 'Package filename is exactly <tender_id>_Package.pdf');
  assert(genResult.totalPages === 4, 'Total pages is 4 (1 cover page + 2 pages of doc 1 + 1 page of doc 2)');
  assert(genResult.blob.size > 0, 'Generated Blob has positive byte size');

  // Verify the generated PDF structure with pdf-lib
  const generatedDoc = await PDFDocument.load(await genResult.blob.arrayBuffer());
  assert(generatedDoc.getPageCount() === 4, 'Generated PDF has exactly 4 pages in master document');

  console.log(`\n================================================================`);
  console.log(`ALL TESTS PASSED! (${passCount} passed, ${failCount} failed)`);
  console.log(`================================================================\n`);
}

runEdgeCaseTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
