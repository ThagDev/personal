import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Db, ObjectId, ReturnDocument } from 'mongodb';
import { PaginationService } from '../../common/pagination/pagination.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { CreateUserWithRolesDto } from './dto/create-user-with-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('MONGO_DB_CONNECTION') private db: Db,
    private readonly paginationService: PaginationService,
    private readonly mailService: MailService,
  ) {}

  async findAllService(query: any) {
    try {
      const getAllUsers = this.db.collection('auth');
      const { page, skip, limit, sortField, sort } =
        this.paginationService.paginate(query, 'username');
      // Chạy song song truy vấn users và countDocuments
      const [users, totalDocuments] = await Promise.all([
        getAllUsers
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
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        getAllUsers.countDocuments(),
      ]);
      return {
        users,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit),
        currentPage: page,
        sortField,
        sortOrder: sort[sortField] === 1 ? 'asc' : 'desc',
      };
    } catch (error) {
      throw new NotFoundException('Failed to get users: ' + error.message);
    }
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
    // Chuẩn hóa dữ liệu trả về: ẩn _id dạng ObjectId, chỉ trả về string
    if (result && result._id) {
      return { ...result, _id: result._id.toString() };
    }
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
    // Chuẩn hóa dữ liệu trả về: ẩn _id dạng ObjectId, chỉ trả về string
    if (result && result._id) {
      return { ...result, _id: result._id.toString() };
    }
    return result;
  }

  async DeleteUserService(id: string) {
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

  // Đổi tên hàm thành UpdateAvatarService cho đúng tả
  UpdateAvatarService(createUserDto: CreateUserDto) {
    return `This action adds a new user ${createUserDto}`;
  }

  async assignRolesToUser(userId: string, roles: string[]) {
    if (!ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user id');
    }
    const userCol = this.db.collection('auth');
    // Có thể kiểm tra role tồn tại trong collection roles nếu muốn strict
    const result = await userCol.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { roles } },
      { returnDocument: ReturnDocument.AFTER },
    );
    if (!result) throw new NotFoundException('User not found');
    const user = result.value || result;
    return { ...user, _id: user._id?.toString?.() ?? user._id };
  }

  async createUserService(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    // Check for duplicate email or username
    const existing = await this.db.collection('auth').findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      // throw new Error('User with this email or username already exists');
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }
    // console.log(existing);
    // Generate random password if not provided
    let plainPassword = password;
    if (!plainPassword) {
      plainPassword = Math.random().toString(36).slice(-8); // 8 ký tự ngẫu nhiên
    }
    // Hash password
    const hash = await bcrypt.hash(plainPassword, 10);
    const userToInsert = {
      email: createUserDto['email'],
      username: createUserDto.username,
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // console.log(userToInsert);
    const result = await this.db.collection('auth').insertOne(userToInsert);
    // Gửi email nếu cần ở đây (nếu có logic)
    return {
      _id: result.insertedId,
      email: userToInsert.email,
    };
  }

  async createUserWithRolesAndSendMail(dto: CreateUserWithRolesDto) {
    const { username, email, roles } = dto;
    // Check for duplicate email or username
    const existing = await this.db.collection('auth').findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      throw new ConflictException('User with this email or username already exists');
    }
    // Generate random password
    const plainPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(plainPassword, 10);
    const userToInsert = {
      email,
      username,
      password: hash,
      roles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.db.collection('auth').insertOne(userToInsert);
    // Gửi email thông tin đăng nhập
    const loginUrl = process.env.LOGIN_URL || 'https://your-app-login-url.com';
    await this.mailService.sendCreateUserInfo({
      fullName: username,
      email,
      password: plainPassword,
      loginUrl,
    });
    return {
      _id: result.insertedId,
      email: userToInsert.email,
    };
  }
}
