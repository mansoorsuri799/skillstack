import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Optional — Google OAuth users may not set a password */
    password: { type: String, required: false, default: null },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    googleId: { type: String, default: null, index: true },
    image: { type: String, required: false },

    /** Public profile — omit until the user chooses a handle (sparse unique). */
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: 32,
    },
    headline: { type: String, default: "", trim: true, maxlength: 120 },
    bio: { type: String, default: "", trim: true, maxlength: 2000 },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          return v.length <= 24;
        },
        message: "Too many skills",
      },
    },
    location: { type: String, default: "", trim: true, maxlength: 80 },
    website: { type: String, default: "", trim: true, maxlength: 200 },
    linkedin: { type: String, default: "", trim: true, maxlength: 200 },
    xProfile: { type: String, default: "", trim: true, maxlength: 200 },
    company: { type: String, default: "", trim: true, maxlength: 100 },
    availableForWork: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);

export type PublicProfile = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  headline: string;
  bio: string;
  skills: string[];
  location: string;
  website: string;
  linkedin: string;
  xProfile: string;
  company: string;
  availableForWork: boolean;
};

export function toPublicProfile(user: UserDocument): PublicProfile {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username ?? null,
    image: user.image ?? null,
    headline: user.headline || "",
    bio: user.bio || "",
    skills: user.skills || [],
    location: user.location || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    xProfile: user.xProfile || "",
    company: user.company || "",
    availableForWork: Boolean(user.availableForWork),
  };
}
