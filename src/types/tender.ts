export interface TenderMetadata {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface RequirementItem {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsFile {
  tender: TenderMetadata;
  requirements: RequirementItem[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sha256: string;
  pageCount: number | null;
  status: 'parsing' | 'ready' | 'error';
  error?: string;
  uploadedAt: number;
}

export type DocumentStatus =
  | 'OK'
  | 'Missing'
  | 'Expiry date needed'
  | 'Expired'
  | 'Not provided';

export interface EvaluatedRequirement {
  requirement: RequirementItem;
  matchedFile: UploadedFileItem | null;
  expiryDate: string; // YYYY-MM-DD
  status: DocumentStatus;
  isBlocking: boolean;
  statusReason: string;
}

export interface DuplicateGroup {
  hash: string;
  files: UploadedFileItem[];
}

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';
