import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const now = new Date();
    const doc = {
      ...createCategoryDto,
      parentId: createCategoryDto.parentId || null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.collection('categories').insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async findAllFlat() {
    return this.db.collection('categories').find().toArray();
  }

  async findAllTree() {
    const categories = await this.findAllFlat();
    return this.buildTree(categories);
  }

  /**
   * Tối ưu buildTree: không đệ quy, dùng Map để xây dựng cây nhanh hơn
   */
  buildTree(categories: any[], parentId: string | null = null) {
    const map = new Map();
    const roots = [];
    // Gán children rỗng cho mỗi node và lưu vào map
    for (const cat of categories) {
      map.set(cat._id.toString(), { ...cat, children: [] });
    }
    // Gán children cho từng node
    for (const cat of categories) {
      const node = map.get(cat._id.toString());
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    // Nếu truyền parentId, chỉ trả về cây con tương ứng
    if (parentId) {
      return roots.filter((r) => r._id.toString() === parentId);
    }
    return roots;
  }

  async findOne(id: string) {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const cat = await this.db
      .collection('categories')
      .findOne({ _id: new ObjectId(id) });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  /**
   * Xóa category và cập nhật parentIds của các node liên quan (graph)
   */
  async remove(id: string) {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    // Xóa node
    await this.db.collection('categories').deleteOne({ _id: new ObjectId(id) });
    // Cập nhật các node có parentIds chứa id này: loại bỏ id khỏi parentIds
    await this.db
      .collection('categories')
      .updateMany(
        { parentIds: { $elemMatch: { $eq: id } } },
        { $pull: { parentIds: { $in: [id] } } as any },
      );
    return { deleted: true };
  }

  /**
   * Cập nhật category, validate parentIds không chứa chính nó và không tạo cycle đơn giản
   */
  async update(id: string, dto: UpdateCategoryDto) {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    if (dto.parentIds && dto.parentIds.includes(id)) {
      throw new BadRequestException('A node cannot be parent of itself');
    }
    // TODO: Có thể bổ sung kiểm tra cycle phức tạp hơn nếu cần
    const result = await this.db
      .collection('categories')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...dto, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
    if (!result.value) throw new NotFoundException('Category not found');
    return result.value;
  }

  async getBreadcrumb(id: string) {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid id');
    const categories = await this.findAllFlat();
    const map = new Map(categories.map((c) => [c._id.toString(), c]));
    const breadcrumb = [];
    let current = map.get(id);
    while (current) {
      breadcrumb.unshift(current);
      current = current.parentId ? map.get(current.parentId) : null;
    }
    return breadcrumb;
  }

  /**
   * Find all categories that have any of the given parentIds (graph style)
   * @param parentIds string[]
   */
  async findByParentIds(parentIds: string[]) {
    // Convert all to string for comparison
    const ids = parentIds.map((id) => id.toString());
    return this.db
      .collection('categories')
      .find({ parentId: { $in: ids } })
      .toArray();
  }

  /**
   * Find all categories that have any of the given parentIds (graph style, parentIds is array in each doc)
   * @param parentIds string[]
   */
  async findByParentIdsGraph(parentIds: string[]) {
    // Tìm tất cả category có ít nhất 1 parent trùng với parentIds
    return this.db
      .collection('categories')
      .find({ parentIds: { $elemMatch: { $in: parentIds } } })
      .toArray();
  }
}
