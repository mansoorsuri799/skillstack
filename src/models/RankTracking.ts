import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const RankSnapshotSchema = new Schema(
  {
    date: { type: Date, required: true },
    position: { type: Number, default: null },
    url: { type: String, default: "" },
  },
  { _id: false },
);

const RankKeywordSchema = new Schema(
  {
    keyword: { type: String, required: true, trim: true, lowercase: true },
    snapshots: { type: [RankSnapshotSchema], default: [] },
    lastPosition: { type: Number, default: null },
  },
  { _id: true },
);

const RankTrackingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, default: "Default", trim: true },
    keywords: { type: [RankKeywordSchema], default: [] },
  },
  { timestamps: true },
);

export type RankTrackingDocument = InferSchemaType<typeof RankTrackingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RankTracking: Model<RankTrackingDocument> =
  mongoose.models.RankTracking ??
  mongoose.model<RankTrackingDocument>("RankTracking", RankTrackingSchema);
