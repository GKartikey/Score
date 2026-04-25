import mongoose from "mongoose";

const auditDecisionSchema = new mongoose.Schema(
  {
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    application: {
      type: Object,
      required: true
    },
    result: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const AuditDecision = mongoose.model("AuditDecision", auditDecisionSchema);
