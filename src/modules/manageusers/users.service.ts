import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserWithRolesDto } from './dto/create-user-with-roles.dto';
import { Db } from 'mongodb';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService extends BaseService {
  protected collectionName = 'users';

  constructor(
    @Inject('MONGO_DB_CONNECTION') db: Db,
    paginationService: PaginationService,
    private readonly mailService: MailService,
  ) {
    super(db, paginationService);
  }

  async createUserService(createUserDto: CreateUserDto) {
    const existing = await this.db
      .collection('users')
      .findOne({ email: createUserDto.email });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async assignRolesToUser(userId: string, roles: string[]) {
    return this.updateById(userId, { roles });
  }

  async createUserWithRolesAndSendMail(dto: CreateUserWithRolesDto) {
    const tempPassword = this.generateRandomPassword();
    const user = await this.createUserService({
      ...dto,
      password: tempPassword,
    });

    if (dto.roles?.length) {
      await this.assignRolesToUser(user._id.toString(), dto.roles);
    }

    // Send email with temp password (implement in mail service)
    // await this.mailService.sendWelcomeEmail(user.email, tempPassword);

    return { ...user, tempPassword }; // Return temp password for now
  }

  private generateRandomPassword(length: number = 12): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
