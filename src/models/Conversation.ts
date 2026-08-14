import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ConversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expertId: { type: String, required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

ConversationSchema.index({ userId: 1, expertId: 1 }, { unique: true });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Conversation: Model<ConversationDocument> =
  mongoose.models.Conversation ??
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);
