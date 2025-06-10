import { Document } from 'mongoose';

export interface Folder extends Document {
  name: string;
  parent?: string;
  userId: string;
}
