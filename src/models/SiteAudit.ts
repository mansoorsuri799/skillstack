import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AuditIssueSchema = new Schema(
  {
    type: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "warning", "notice"],
      default: "notice",
    },
    message: { type: String, required: true },
    url: { type: String, default: "" },
  },
  { _id: true },
);

const SiteAuditSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    score: { type: Number, default: null },
    pagesCrawled: { type: Number, default: 0 },
    issues: { type: [AuditIssueSchema], default: [] },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true },
);

export type SiteAuditDocument = InferSchemaType<typeof SiteAuditSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteAudit: Model<SiteAuditDocument> =
  mongoose.models.SiteAudit ??
  mongoose.model<SiteAuditDocument>("SiteAudit", SiteAuditSchema);
