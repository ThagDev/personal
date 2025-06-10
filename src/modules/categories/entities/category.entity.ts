export class Category {
  _id?: string;
  name: string;
  parentId?: string | null;
  parentIds?: string[] | null;
  slug?: string;
  description?: string;
  order?: number;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
