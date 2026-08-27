import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SavedKeywordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    keyword: { type: String, required: true, trim: true, lowercase: true },
    searchVolume: { type: Number, default: null },
    cpc: { type: Number, default: null },
    difficulty: { type: Number, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

SavedKeywordSchema.index({ projectId: 1, keyword: 1 }, { unique: true });

export type SavedKeywordDocument = InferSchemaType<typeof SavedKeywordSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SavedKeyword: Model<SavedKeywordDocument> =
  mongoose.models.SavedKeyword ??
  mongoose.model<SavedKeywordDocument>("SavedKeyword", SavedKeywordSchema);
