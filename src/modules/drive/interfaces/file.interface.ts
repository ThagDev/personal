import { Document } from 'mongoose';

export interface File extends Document {
  name: string;
  parent: string;
  path: string;
  mimeType: string;
  size: number;
  userId: string;
  url?: string;
}

// Nếu muốn chuẩn hóa response upload file GridFS, có thể định nghĩa thêm:
export interface UploadedFileMeta {
  fileId: string | null;
  originalname: string;
  mimetype: string;
  size: number;
  userId: string;
  error?: string;
}
