import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sources: [
      {
        title: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
    attachments: [
      {
        name: { type: String, default: "" },
        mimeType: { type: String, default: "" },
        size: { type: Number, default: 0 },
        kind: {
          type: String,
          enum: ["image", "document", "archive", "spreadsheet"],
          default: "document",
        },
      },
    ],
    fileContext: { type: String, default: "" },
    editedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ProjectChatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, default: "New chat", trim: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true },
);

ProjectChatSchema.index({ userId: 1, projectId: 1, updatedAt: -1 });

export type ProjectChatDocument = InferSchemaType<typeof ProjectChatSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProjectChat: Model<ProjectChatDocument> =
  mongoose.models.ProjectChat ??
  mongoose.model<ProjectChatDocument>("ProjectChat", ProjectChatSchema);
