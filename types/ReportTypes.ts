export type TestResultInput = {
  uploadedBy: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  imageKitFileId?: string;
  score?: Array<{
    name: string;
    relatedTo: string;
    value?: number | string;
    unit?: string;
    range?: [number, number];
    expectedRange?: [number, number];
    remarks?: string;
    verdict: boolean;
  }>;
};