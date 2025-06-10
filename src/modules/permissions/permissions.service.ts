import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}

  async createPermission(permission: Permission) {
    const existing = await this.db
      .collection('permissions')
      .findOne({ name: permission.name });
    if (existing) throw new ConflictException('Permission already exists');
    const { insertedId } = await this.db
      .collection('permissions')
      .insertOne(permission);
    return this.db.collection('permissions').findOne({ _id: insertedId });
  }

  async findAll(query?: any) {
    // Thêm phân trang và sắp xếp nếu có query
    const permissionDb = this.db.collection('permissions');
    if (query && (query.page || query.limit)) {
      const sortOrder = query.sort === 'false' ? -1 : 1;
      const sortField = query.sortField || 'user';
      const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const [permissions, totalDocuments] = await Promise.all([
        permissionDb.find({}).sort(sort as any).skip(skip).limit(limit).toArray(),
        permissionDb.countDocuments(),
      ]);
      return {
        permissions,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sort[sortField] === 1 ? 'asc' : 'desc',
      };
    }
    return permissionDb.find().toArray();
  }

  async findOne(id: string) {
    const permission = await this.db
      .collection('permissions')
      .findOne({ _id: new ObjectId(id) });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, dto: Permission) {
    const result = await this.db
      .collection('permissions')
      .updateOne({ _id: new ObjectId(id) }, { $set: dto });
    if (result.matchedCount === 0) throw new NotFoundException('Permission not found');
    return this.db.collection('permissions').findOne({ _id: new ObjectId(id) });
  }

  async remove(id: string) {
    const permission = await this.db
      .collection('permissions')
      .findOne({ _id: new ObjectId(id) });
    if (!permission) throw new NotFoundException('Permission not found');
    await this.db
      .collection('permissions')
      .deleteOne({ _id: new ObjectId(id) });
    return { deleted: true };
  }
}
