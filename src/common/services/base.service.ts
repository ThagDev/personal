import { Injectable, NotFoundException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { PaginationService } from '../pagination/pagination.service';

/**
 * Base Service - Cung cấp các method CRUD chung
 */
@Injectable()
export abstract class BaseService {
  protected abstract collectionName: string;

  constructor(
    protected readonly db: Db,
    protected readonly paginationService: PaginationService,
  ) {}

  /**
   * Tìm tất cả documents với pagination
   */
  async findAll(query: any, defaultSortField: string = 'createdAt') {
    const { page, skip, limit, sort } = this.paginationService.paginate(query, defaultSortField);
    
    const collection = this.db.collection(this.collectionName);
    const [data, total] = await Promise.all([
      collection.find({}).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments({}),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm một document theo ID
   */
  async findById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }

    const doc = await this.db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      throw new NotFoundException(`${this.collectionName} not found`);
    }

    return doc;
  }

  /**
   * Cập nhật document theo ID
   */
  async updateById(id: string, updateData: any) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }

    const result = await this.db
      .collection(this.collectionName)
      .updateOne(
        { _id: new ObjectId(id) }, 
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`${this.collectionName} not found`);
    }

    return this.db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) });
  }

  /**
   * Xóa document theo ID
   */
  async deleteById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }

    const doc = await this.findById(id); // Check existence
    
    await this.db
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });

    return { deleted: true, deletedDocument: doc };
  }

  /**
   * Tạo document mới
   */
  async create(createData: any) {
    const result = await this.db
      .collection(this.collectionName)
      .insertOne({
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return this.db
      .collection(this.collectionName)
      .findOne({ _id: result.insertedId });
  }
}
