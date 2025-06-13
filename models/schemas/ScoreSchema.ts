import { Schema } from "mongoose";

// Score Subschema
export const ScoreSchema = new Schema(
  {
    name: { type: String, required: true }, // Test name
    relatedTo: { type: String, required: true }, // Test name
    value: { type: Schema.Types.Mixed }, // Accepts number or string
    unit: { type: String }, // e.g., mg/L
    range: {
      type: [Number], // Observed range
      validate: {
        validator: (v: number[]) => {
          if (!v || v.length == 0) return true;
          return v.length === 2;
        },
        message: "Range must contain exactly two numbers",
      },
    },
    expectedRange: {
      type: [Number], // Ideal/expected range
      validate: {
        validator: (v: number[]) => {
          if (!v || v.length == 0) return true;
          return v.length === 2;
        },
        message: "Expected range must contain exactly two numbers",
      },
    },
    remarks: { type: String }, // Optional notes
    verdict: { type: Boolean, required: true },
  },
  { _id: false }
);
