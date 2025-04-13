import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, ProfileUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Db, ObjectId, ReturnDocument } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(@Inject('MONGO_DB_CONNECTION') private db: Db) {}
  async ProfileService(request: any, profileUserDto: ProfileUserDto) {
    try {
      const { ...data } = profileUserDto;
      const getUser = await this.db.collection('auth').findOneAndUpdate(
        { _id: new ObjectId(request.user._id) },
        { $set: data },
        {
          projection: {
            code: 0,
            verified: 0,
            accessToken: 0,
            refreshToken: 0,
          },
          returnDocument: ReturnDocument.AFTER,
        },
      );

      return getUser;
    } catch (error) {
      throw new NotFoundException('user not found');
    }
  }
  UpateAvatarService(createUserDto: CreateUserDto) {
    return `This action adds a new user ${createUserDto}`;
  }

  async findAllService(
    page: number,
    limit: number,
    sortField: string,
    sort: boolean,
  ) {
    try {
      const getAllUsers = this.db.collection('auth');

      const skip = (page - 1) * limit; // Số lượng bản ghi cần bỏ qua
      // Nhận sortField và sort theo true/false (true: tăng dần, false: giảm dần)

      // Chuyển đổi sort từ boolean thành 1 hoặc -1 cho MongoDB
      const sortOrder = sort ? 1 : -1;
      const users = await getAllUsers
        .find(
          {},
          {
            projection: {
              code: 0,
              verified: 0,
              accessToken: 0,
              refreshToken: 0,
            },
          },
        )
        .sort({ [sortField]: sortOrder }) // Sắp xếp theo trường cụ thể và thứ tự
        .skip(skip) // Bỏ qua số lượng bản ghi cần thiết dựa vào trang
        .limit(limit) // Giới hạn số lượng bản ghi trả về
        .toArray();

      // Trả về kết quả của trang hiện tại và tổng số bản ghi
      const totalDocuments = await getAllUsers.countDocuments(); // Đếm tổng số bản ghi
      return {
        users,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit), // Tổng số trang
        currentPage: page,
        sortField, // Trường đang được sắp xếp
        sortOrder: sort ? 'asc' : 'desc', // Thứ tự sắp xếp (asc: tăng dần, desc: giảm dần)
      };
    } catch (error) {}
  }

  async findOneService(id: string) {
    if (!ObjectId.isValid(id))
      throw new NotFoundException({ message: 'id not found' });
    const getUser = this.db.collection('auth');
    const result = await getUser.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          code: 0,
          verified: 0,
          accessToken: 0,
          refreshToken: 0,
        },
      },
    );
    if (!result) throw new NotFoundException({ message: 'user not found' });
    return result;
  }

  async UpdateUserService(id: string, updateUserDto: UpdateUserDto) {
    if (!ObjectId.isValid(id))
      throw new NotFoundException({ message: 'id not found' });
    const getUser = this.db.collection('auth');
    const result = await getUser.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateUserDto },
      {
        projection: {
          code: 0,
          verified: 0,
          accessToken: 0,
          refreshToken: 0,
        },
        returnDocument: ReturnDocument.AFTER,
      },
    );
    if (!result) throw new NotFoundException({ message: 'user not found' });
    return result;
  }

  async DeteletUserService(id: string) {
    if (!ObjectId.isValid(id))
      throw new NotFoundException({ message: 'id not found' });
    const getUser = this.db.collection('auth');
    const result = await getUser.findOneAndDelete(
      { _id: new ObjectId(id) },
      {
        projection: {
          code: 0,
          verified: 0,
          accessToken: 0,
          refreshToken: 0,
        },
      },
    );
    if (!result) {
      throw new NotFoundException({ message: 'user not found' });
    }
    return { message: 'delete success' };
  }
}
