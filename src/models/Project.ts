import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ProjectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    domain: { type: String, required: true, trim: true, lowercase: true },
    locationCode: { type: Number, default: 2840 },
    languageCode: { type: String, default: "en" },
    gscConnected: { type: Boolean, default: false },
    gscSiteUrl: { type: String, default: null },
    gscPendingSites: { type: [String], default: null, select: false },
    gscRefreshToken: { type: String, default: null, select: false },
    gscAccessToken: { type: String, default: null, select: false },
    gscTokenExpiry: { type: Date, default: null, select: false },
    mcpConnected: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ProjectSchema.index({ userId: 1 }, { unique: true });

export type ProjectDocument = InferSchemaType<typeof ProjectSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Project: Model<ProjectDocument> =
  mongoose.models.Project ??
  mongoose.model<ProjectDocument>("Project", ProjectSchema);

export type ProjectDto = {
  id: string;
  name: string;
  domain: string;
  locationCode: number;
  languageCode: string;
  gscConnected: boolean;
  gscSiteUrl: string | null;
  mcpConnected: boolean;
};

export function toProjectDto(project: ProjectDocument): ProjectDto {
  return {
    id: project._id.toString(),
    name: project.name,
    domain: project.domain,
    locationCode: project.locationCode,
    languageCode: project.languageCode,
    gscConnected: Boolean(project.gscConnected),
    gscSiteUrl: project.gscSiteUrl ?? null,
    mcpConnected: Boolean(project.mcpConnected),
  };
}
