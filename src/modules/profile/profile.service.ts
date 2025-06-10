import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Db, GridFSBucket, ObjectId } from 'mongodb';
// import * as bcrypt from 'bcryptjs';
import * as bcrypt from 'bcrypt';
import { FileAvatarResponse } from './types/avatar.interdace';
import { CreateProfileDto } from './dto/create-profile.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('MONGO_DB_CONNECTION') private db: Db,
    @Inject('MONGO_DB_CONNECTION_GridFSBucket')
    private readonly gridFSBucket: GridFSBucket,
    private readonly mailerService: MailerService,
  ) {}

  async getMe(email: string) {
    const user = await this.db.collection('auth').findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    const resData = {
      email: user.email || '',
      avatar: user.avatar || '',
      roles: Array.isArray(user.roles) ? user.roles : ['user'],
      username: user.username || '',
      phonenumber: user.phonenumber || '',
      address: user.address || '',
      gender: user.gender || '',
      birthday: user.birthday || '',
    };
    return resData;
  }

  async updateMe(email: string, updateProfileDto: CreateProfileDto) {
    const result = await this.db
      .collection('auth')
      .updateOne(
        { email },
        { $set: { ...updateProfileDto, updatedAt: new Date() } },
      );
    if (result.modifiedCount === 0)
      throw new NotFoundException('User not found or nothing updated');
    return { message: 'Profile updated successfully' };
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.db.collection('auth').findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new BadRequestException('Password not set');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.db
      .collection('auth')
      .updateOne(
        { email },
        { $set: { password: hash, updatedAt: new Date() } },
      );
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.db.collection('auth').findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    // Sinh token reset password (random string, có hạn)
    const token = Math.random().toString(36).substring(2) + Date.now();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    // Lưu token vào user (hoặc bảng riêng)
    await this.db
      .collection('auth')
      .updateOne(
        { email },
        { $set: { resetPasswordToken: token, resetPasswordExpires: expires } },
      );
    // Gửi email (dùng mail.service)
    // Lấy URL frontend từ biến môi trường, ưu tiên DEV/PROD
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_URL_DEV ||
      process.env.FRONTEND_URL_PROD ||
      'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    // Gửi email thực tế
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });
    // TODO: Bỏ comment dòng trên khi đã cấu hình mail service
    return {
      message:
        'Password reset instructions sent to email (nếu cấu hình mail service)',
      resetLink,
    };
  }

  async updateAvatar(
    file: Express.Multer.File,
    req: any,
  ): Promise<FileAvatarResponse> {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        'File size exceeds the maximum limit of 5MB.',
      );
    }
    return new Promise((resolve, reject) => {
      const fileId = new ObjectId();
      const writeStream = this.gridFSBucket.openUploadStreamWithId(
        fileId,
        file.originalname,
        {
          contentType: file.mimetype,
        },
      );

      writeStream.write(file.buffer);
      writeStream.end();

      writeStream.on('finish', async () => {
        // Lấy host và protocol từ request
        const host = req.headers['host'];
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const url = `${protocol}://${host}/profile/avatar/${fileId}`;
        await this.db
          .collection('auth')
          .updateOne(
            { email: req.user.email },
            { $set: { avatar: url, updatedAt: new Date() } },
          );
        resolve({
          id: fileId.toString(),
          url: url,
        });
      });

      writeStream.on('error', reject);
    });
  }
  async getAvatarByIdService(id: string, res: any) {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid file id' });
      return;
    }
    try {
      const objectId = new ObjectId(id);
      const file = await this.gridFSBucket.find({ _id: objectId }).next();

      if (!file)
        throw new InternalServerErrorException({
          message: 'File download failed',
          error: 'File not found',
        });

      res.setHeader('Content-Type', 'image/webp'); // Đảm bảo Content-Type là webp
      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);

      downloadStream.pipe(res).on(
        'error',
        (error: any) => {
          throw new InternalServerErrorException({
            message: 'File download failed',
            error: error,
          });
        },
        // this.handleError(res, 'File download failed', 404, error),
      );
    } catch (error) {
      // this.handleError(res, 'Invalid file ID', 400, error);
      throw new InternalServerErrorException({
        message: 'Invalid file ID',
        error: error,
      });
    }
  }

  /**
   * Đặt lại mật khẩu bằng token (từ email)
   * Bước 1: Kiểm tra token hợp lệ, còn hạn không
   * Bước 2: Nếu hợp lệ, hash mật khẩu mới và cập nhật vào user
   * Bước 3: Xóa token reset khỏi user (hoặc vô hiệu hóa)
   */
  async resetPassword(token: string, newPassword: string) {
    // Tìm user có token và token còn hạn
    const user = await this.db.collection('auth').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    // Hash mật khẩu mới
    const hash = await bcrypt.hash(newPassword, 10);
    // Cập nhật mật khẩu và xóa token
    await this.db.collection('auth').updateOne(
      { _id: user._id },
      {
        $set: { password: hash, updatedAt: new Date() },
        $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
      },
    );
    return {
      message:
        'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
    };
  }
}
