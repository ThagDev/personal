import { Schema } from 'mongoose';

export const FolderSchema = new Schema(
  {
    name: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Folder' }, // optional for root folders
    userId: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
