import { EvaluatedRequirement, TenderMetadata } from '../types/tender';

/**
 * Generates and downloads a detailed CSV audit report for the tender requirements.
 * Includes UTF-8 BOM so Excel opens Bangla and English characters correctly.
 */
export function exportChecklistToCSV(
  tender: TenderMetadata,
  evaluatedList: EvaluatedRequirement[]
): void {
  const headers = [
    'Order',
    'Requirement ID',
    'Document Title (EN)',
    'Document Title (BN)',
    'Type',
    'Has Expiry',
    'Matched PDF File',
    'Page Count',
    'Expiry Date',
    'Status',
    'Is Blocking',
    'Reason / Verification Note',
  ];

  const rows = evaluatedList.map((item) => {
    const req = item.requirement;
    const file = item.matchedFile;

    return [
      req.order,
      `"${req.id.replace(/"/g, '""')}"`,
      `"${req.title_en.replace(/"/g, '""')}"`,
      `"${req.title_bn.replace(/"/g, '""')}"`,
      req.mandatory ? 'Mandatory' : 'Optional',
      req.has_expiry ? 'Yes' : 'No',
      file ? `"${file.name.replace(/"/g, '""')}"` : 'None',
      file?.pageCount ?? 0,
      item.expiryDate || 'N/A',
      item.status,
      item.isBlocking ? 'BLOCKING' : 'VALID',
      `"${item.statusReason.replace(/"/g, '""')}"`,
    ];
  });

  // Metadata header lines
  const metaLines = [
    `"TENDER AUDIT & COMPLIANCE REPORT"`,
    `"Tender ID:","${tender.tender_id}"`,
    `"Title:","${tender.title.replace(/"/g, '""')}"`,
    `"Procuring Entity:","${tender.procuring_entity.replace(/"/g, '""')}"`,
    `"Bidder:","${tender.bidder.replace(/"/g, '""')}"`,
    `"Submission Deadline:","${tender.submission_deadline}"`,
    `"Report Export Date:","${new Date().toISOString().split('T')[0]}"`,
    '',
  ];

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel
    metaLines.join('\n') +
    headers.join(',') +
    '\n' +
    rows.map((r) => r.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${tender.tender_id}_Audit_Report.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
