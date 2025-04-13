import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class RolesService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}
  async create(createRoleDto: CreateRoleDto) {
    // Kiểm tra xem role đã tồn tại chưa
    const existingRole = await this.db.collection('roles').findOne({
      role: createRoleDto.role,
    });
    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    // Chèn vào DB nếu không tồn tại
    const { insertedId } = await this.db
      .collection('roles')
      .insertOne(createRoleDto);

    // Trả về document mới chèn
    return this.db.collection('roles').findOne({ _id: insertedId });
  }

  async findAll(page: number, limit: number, sortField: string, sort: boolean) {
    try {
      const roleDb = this.db.collection('roles');

      const skip = (page - 1) * limit; // Số lượng bản ghi cần bỏ qua
      // Nhận sortField và sort theo true/false (true: tăng dần, false: giảm dần)

      // Chuyển đổi sort từ boolean thành 1 hoặc -1 cho MongoDB
      const sortOrder = sort ? 1 : -1;
      const role = await roleDb
        .find({})
        .sort({ [sortField]: sortOrder }) // Sắp xếp theo trường cụ thể và thứ tự
        .skip(skip) // Bỏ qua số lượng bản ghi cần thiết dựa vào trang
        .limit(limit) // Giới hạn số lượng bản ghi trả về
        .toArray();

      // Trả về kết quả của trang hiện tại và tổng số bản ghi
      const totalDocuments = await roleDb.countDocuments(); // Đếm tổng số bản ghi
      return {
        role,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit), // Tổng số trang
        currentPage: page,
        sortField, // Trường đang được sắp xếp
        sortOrder: sort ? 'asc' : 'desc', // Thứ tự sắp xếp (asc: tăng dần, desc: giảm dần)
      };
    } catch (error) {}
  }

  async findOne(id: string) {
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
    try {
      const roleDb = this.db.collection('roles');
      const findRole = await roleDb.findOne({ _id: new ObjectId(id) });
      if (!findRole) throw new NotFoundException('Role not found');
      return await roleDb.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateRoleDto },
      );
    } catch (error) {
      throw new NotFoundException('Role not found');
    }
  }

  async remove(id: string) {
    try {
      const roleDb = this.db.collection('roles');
      const findRole = await roleDb.findOne({ _id: new ObjectId(id) });
      if (!findRole) throw new NotFoundException('Role not found');
      return await roleDb.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw new NotFoundException('Role not found');
    }
  }
}
