import { Schema } from "mongoose";
import { ScoreSchema } from "./ScoreSchema";

export const TestResultSchema = new Schema(
  {
    fileUrl: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    imageKitFileId: { type: String },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: [ScoreSchema],
      default: [],
    },
  },
  { _id: false }
);

TestResultSchema.pre("validate", function (next) {
  console.log("Validating testResult:", this.toObject());

  const hasFile =
    this.fileUrl && this.fileType && this.fileSize && this.imageKitFileId;
  const hasScore = Array.isArray(this.score) && this.score.length > 0;
  console.log("hasFile:", hasFile, "hasScore:", hasScore);

  if (!hasFile && !hasScore) {
    this.invalidate(
      "testResult",
      "Each testResult must have either a complete file or at least one score."
    );
  }

  next();
});
