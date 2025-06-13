// models/Report.ts
import { Schema, model, models, Types } from "mongoose";
import type { TestResultInput } from "@/types/ReportTypes";
import { TestResultSchema } from "./schemas/TestResultSchema";
export interface IReport {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  isPrivate?: boolean; // From ImageKit's isPrivateFile
  tags?: string[]; // Custom metadata
  region: string;
  uploadedBy: Types.ObjectId;
  sharedWith: Types.ObjectId[];
  fileUrl?: string; // Direct file URL from ImageKit
  fileType?: string; // Optional: 'pdf', 'docx', 'xlsx', etc.
  fileSize?: number; // In bytes
  imageKitFileId?: string; // To enable future deletion or signed access
  // folder?: string;               // "reports", "invoices", etc.
  similarTo?: Types.ObjectId[];
  status?:
    | "pending"
    | "reviewed"
    | "approved"
    | "ApprovedByFinance"
    | "RejectedByLab"
    | "RejectedByFinance"
    | "RejectedByAdmin";
  testsToConduct?: string[]; // this is given by sales person
  testResults?: Array<{
    fileUrl?: string; // Lab Tester's report URL
    fileType?: string;
    fileSize?: number;
    imageKitFileId?: string;
    uploadedBy: Types.ObjectId; // Lab Tester
    score?: Array<{
      name: string; // Name of the test or metric
      relatedTo: string;
      value?: number | string; // Actual measured value
      unit?: string; // Measurement unit (e.g., mg/L, %, etc.)
      range?: [number, number]; // Observed range (if applicable)
      expectedRange?: [number, number]; // Ideal or expected range
      remarks?: string; // Optional comments or notes
      verdict: boolean;
    }>;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const reportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    description: { type: String },
    isPrivate: { type: Boolean, default: false },
    tags: [{ type: String }], // metadata for filtering
    region: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true }, // e.g., 'pdf', 'docx', etc.
    fileSize: { type: Number, required: true }, // in bytes
    imageKitFileId: { type: String, required: true }, // needed for deletions
    // folder: { type: String }, // logical folder structure
    similarTo: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    status: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "approved",
        "ApprovedByFinance",
        "RejectedByLab",
        "RejectedByFinance",
        "RejectedByAdmin",
      ],
      default: "pending",
    },
    testsToConduct: { type: [String] },
    testResults: [TestResultSchema],
  },
  { timestamps: true }
);

const Report = models.Report || model<IReport>("Report", reportSchema);

export default Report;
