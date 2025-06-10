import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { Policy } from './entities/policy.entity';

@Injectable()
export class PoliciesService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}

  async createPolicy(policy: Policy) {
    const existing = await this.db
      .collection('policies')
      .findOne({ name: policy.name });
    if (existing) throw new ConflictException('Policy already exists');
    const { insertedId } = await this.db
      .collection('policies')
      .insertOne(policy);
    return this.db.collection('policies').findOne({ _id: insertedId });
  }

  async findAll(query?: any) {
    // Thêm phân trang và sắp xếp nếu có query
    const policyDb = this.db.collection('policies');
    if (query && (query.page || query.limit)) {
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      const sortField = query.sortField || 'name';
      const sortOrder = query.sort === 'false' ? -1 : 1;
      const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };
      const [policies, totalDocuments] = await Promise.all([
        policyDb.find({}).sort(sort as any).skip(skip).limit(limit).toArray(),
        policyDb.countDocuments(),
      ]);
      return {
        policies,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sort[sortField] === 1 ? 'asc' : 'desc',
      };
    }
    return policyDb.find().toArray();
  }

  async findOne(id: string) {
    const policy = await this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(id) });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async update(id: string, dto: Policy) {
    const result = await this.db
      .collection('policies')
      .updateOne({ _id: new ObjectId(id) }, { $set: dto });
    if (result.matchedCount === 0) throw new NotFoundException('Policy not found');
    return this.db.collection('policies').findOne({ _id: new ObjectId(id) });
  }

  async remove(id: string) {
    const policy = await this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(id) });
    if (!policy) throw new NotFoundException('Policy not found');
    await this.db.collection('policies').deleteOne({ _id: new ObjectId(id) });
    return { deleted: true };
  }

  async assignPermissionToPolicy(policyId: string, permissionName: string) {
    const policy = await this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
    if (!policy) throw new NotFoundException('Policy not found');
    await this.db
      .collection('policies')
      .updateOne(
        { _id: new ObjectId(policyId) },
        { $addToSet: { permissions: permissionName } },
      );
    return this.db
      .collection('policies')
      .findOne({ _id: new ObjectId(policyId) });
  }
}
