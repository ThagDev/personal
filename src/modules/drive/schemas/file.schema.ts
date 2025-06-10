import { Schema } from 'mongoose';

export const FileSchema = new Schema(
  {
    name: { type: String, required: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      required: false,
      default: null,
    },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    userId: { type: String, required: true },
    url: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
