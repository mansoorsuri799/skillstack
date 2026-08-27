import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from "mongoose";

const RankSnapshotSchema = new Schema(
  {
    date: { type: Date, required: true },
    position: { type: Number, default: null },
    url: { type: String, default: "" },
  },
  { _id: false },
);

const TrackedKeywordSchema = new Schema(
  {
    keyword: { type: String, required: true, trim: true, lowercase: true },
    snapshots: { type: [RankSnapshotSchema], default: [] },
    lastPosition: { type: Number, default: null },
    searchVolume: { type: Number, default: null },
    etv: { type: Number, default: null },
  },
  { _id: true },
);

const TrackedDomainSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    domain: { type: String, required: true, trim: true, lowercase: true },
    locationCode: { type: Number, default: 2840 },
    languageCode: { type: String, default: "en", trim: true },
    searchTargeting: {
      type: String,
      enum: ["national", "local"],
      default: "national",
    },
    device: {
      type: String,
      enum: ["mobile", "desktop", "both"],
      default: "mobile",
    },
    schedule: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    searchDepth: { type: Number, default: 40 },
    keywords: { type: [TrackedKeywordSchema], default: [] },
  },
  { timestamps: true },
);

TrackedDomainSchema.index({ projectId: 1, domain: 1 }, { unique: true });

export type TrackedDomainDocument = HydratedDocument<
  InferSchemaType<typeof TrackedDomainSchema>
>;

export const TrackedDomain: Model<TrackedDomainDocument> =
  mongoose.models.TrackedDomain ??
  mongoose.model<TrackedDomainDocument>("TrackedDomain", TrackedDomainSchema);
