import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { Db } from 'mongodb';

@Injectable()
export class RolesService extends BaseService {
  protected collectionName = 'roles';

  constructor(
    @Inject('MONGO_DB_CONNECTION') db: Db,
    paginationService: PaginationService,
  ) {
    super(db, paginationService);
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.db.collection('roles')
      .findOne({ name: createRoleDto.name });
    
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return super.create(createRoleDto);
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    return this.updateById(roleId, { permissions });
  }

  async assignPoliciesToRole(roleId: string, policies: string[]) {
    return this.updateById(roleId, { policies });
  }
}
      .insertOne(createRoleDto);

    // Trả về document mới chèn
    return this.db.collection('roles').findOne({ _id: insertedId });
  }

  async findAll(query: any) {
    try {
      const roleDb = this.db.collection('roles');
      const { page, skip, limit, sortField, sort } =
        this.paginationService.paginate(query, 'role');
      // Chạy song song truy vấn roles và countDocuments
      const [roleDocs, totalDocuments] = await Promise.all([
        roleDb.find({}).sort(sort).skip(skip).limit(limit).toArray(),
        roleDb.countDocuments(),
      ]);
      // Chuẩn hóa _id về string
      const role = roleDocs.map((r) => ({ ...r, _id: r._id.toString() }));
      return {
        role,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sort[sortField] === 1 ? 'asc' : 'desc',
      };
    } catch (error) {
      throw new NotFoundException('Failed to get roles: ' + error.message);
    }
  }

  async findOne(id: string) {
    if (!ObjectId.isValid(id)) throw new NotFoundException('Invalid id');
    try {
      const roleDb = this.db.collection('roles');
      const findRole = await roleDb.findOne({ _id: new ObjectId(id) });
      if (!findRole) throw new NotFoundException('Role not found');
      return findRole;
    } catch (error) {
      throw new NotFoundException('Role not found');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!ObjectId.isValid(id)) throw new NotFoundException('Invalid id');
    const roleDb = this.db.collection('roles');
    const result = await roleDb.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateRoleDto },
    );
    if (result.matchedCount === 0) throw new NotFoundException('Role not found');
    return roleDb.findOne({ _id: new ObjectId(id) });
  }

  async remove(id: string) {
    if (!ObjectId.isValid(id)) throw new NotFoundException('Invalid id');
    const roleDb = this.db.collection('roles');
    const result = await roleDb.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new NotFoundException('Role not found');
    return { deleted: true };
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    if (!ObjectId.isValid(roleId)) {
      throw new NotFoundException('Invalid role id');
    }
    const roleDb = this.db.collection('roles');
    const result = await roleDb.updateOne(
      { _id: new ObjectId(roleId) },
      { $addToSet: { permissions: { $each: permissions } } },
    );
    if (result.matchedCount === 0) throw new NotFoundException('Role not found');
    return roleDb.findOne({ _id: new ObjectId(roleId) });
  }

  async assignPoliciesToRole(roleId: string, policies: string[]) {
    if (!ObjectId.isValid(roleId)) {
      throw new NotFoundException('Invalid role id');
    }
    const roleDb = this.db.collection('roles');
    const result = await roleDb.updateOne(
      { _id: new ObjectId(roleId) },
      { $addToSet: { policies: { $each: policies } } },
    );
    if (result.matchedCount === 0) throw new NotFoundException('Role not found');
    return roleDb.findOne({ _id: new ObjectId(roleId) });
  }
}
