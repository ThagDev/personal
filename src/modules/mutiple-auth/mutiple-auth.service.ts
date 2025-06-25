import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MutipleAuth } from './entities/mutiple-auth.entity';
import { CreateMutipleAuthDto } from './dto/create-mutiple-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SendEmailDto } from './dto/send-email.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { MailService } from '../mail/mail.service';
import { Inject } from '@nestjs/common';
import { MutipleAuthMessages } from './mutiple-auth.messages';

@Injectable()
export class MutipleAuthService {
  constructor(
    @InjectModel(MutipleAuth.name)
    private readonly mutipleAuthModel: Model<MutipleAuth>,
    private readonly jwtService: JwtService,
    @Inject(MailService) private readonly mailService: MailService,
  ) {}

  private toClientJson(user: MutipleAuth) {
    return {
      email: user.email,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      avatar: (user as any).avatar,
      roles: Array.isArray((user as any).roles)
        ? (user as any).roles
        : ['user'],
      username: (user as any).username,
      updatedAt: user.updatedAt
        ? { $date: user.updatedAt.toISOString() }
        : null,
      verified: typeof user.verified === 'boolean' ? user.verified : false,
    };
  }

  async register(createDto: CreateMutipleAuthDto) {
    const { email, password } = createDto;
    const existing = await this.mutipleAuthModel.findOne({ email });
    if (existing)
      throw new UnauthorizedException(MutipleAuthMessages.EMAIL_EXISTS);
    const hash = await bcrypt.hash(password, 10);
    const user = new this.mutipleAuthModel({ email, password: hash });
    await user.save();
    return { message: 'Register success' };
  }

  private generateTokens(user: MutipleAuth) {
    const accessToken = this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
      },
      {
        expiresIn: '15m', // Đặt thời gian sống accessToken rất ngắn để test refresh
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
      },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  async login(createDto: CreateMutipleAuthDto) {
    const { email, password } = createDto;
    // BỎ .lean() để lấy instance model
    const user = await this.mutipleAuthModel.findOne({ email });
    if (!user)
      throw new UnauthorizedException(MutipleAuthMessages.INVALID_CREDENTIALS);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new UnauthorizedException(MutipleAuthMessages.INVALID_CREDENTIALS);
    const { accessToken, refreshToken } = this.generateTokens(user);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();
    return this.toClientJson(user);
  }

  async loginWithUser(user: MutipleAuth) {
    const { accessToken, refreshToken } = this.generateTokens(user);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();
    return this.toClientJson(user);
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      // BỎ .lean() để lấy instance model
      const user = await this.mutipleAuthModel.findOne({
        email: payload.email,
        refreshToken,
      });
      if (!user)
        throw new UnauthorizedException(
          MutipleAuthMessages.INVALID_REFRESH_TOKEN,
        );

      // Tạo cả access token và refresh token mới (token rotation)
      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user);
      user.accessToken = accessToken;
      user.refreshToken = newRefreshToken; // Cập nhật refresh token mới
      await user.save();
      return this.toClientJson(user);
    } catch (error) {
      // Log error để debug nếu cần
      console.error('Refresh token error:', error);
      throw new UnauthorizedException(
        MutipleAuthMessages.INVALID_REFRESH_TOKEN,
      );
    }
  }

  async logout(email: string) {
    // BỎ .lean() để lấy instance model
    const user = await this.mutipleAuthModel.findOne({ email });
    if (!user)
      throw new UnauthorizedException(MutipleAuthMessages.EMAIL_NOT_FOUND);
    user.accessToken = '';
    user.refreshToken = '';
    await user.save();
    return { message: MutipleAuthMessages.LOGOUT_SUCCESS };
  }

  async validateUser(email: string, password: string) {
    // KHÔNG dùng .lean() để trả về instance model
    const user = await this.mutipleAuthModel.findOne({ email });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateAndSendVerificationCode(
    email: string,
    user?: MutipleAuth,
  ) {
    const code = this.generateCode();
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    let targetUser = user;
    if (targetUser) {
      targetUser.code = code;
      targetUser.codeExpiresAt = codeExpiresAt;
      targetUser.verified = false;
      targetUser.updatedAt = new Date();
      await targetUser.save();
    } else {
      targetUser = new this.mutipleAuthModel({
        email,
        password: '',
        code,
        codeExpiresAt,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await targetUser.save();
    }
    await this.mailService.SendEmailNodemailer(email, code);
    return { message: MutipleAuthMessages.CODE_SENT };
  }

  async sendEmailService(dto: SendEmailDto) {
    try {
      const user = await this.mutipleAuthModel.findOne({ email: dto.email });
      return await this.generateAndSendVerificationCode(dto.email, user);
    } catch (error) {
      // Ghi log lỗi chi tiết để debug
      // console.error('sendEmailService error:', error);
      throw error;
    }
  }

  async verifyCodeService(dto: VerifyCodeDto) {
    try {
      const user = await this.mutipleAuthModel.findOne({ email: dto.email });
      if (!user)
        throw new UnauthorizedException(MutipleAuthMessages.EMAIL_NOT_FOUND);
      // if (user.verified) return { message: MutipleAuthMessages.VERIFIED };
      if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
        throw new UnauthorizedException(MutipleAuthMessages.CODE_EXPIRED);
      }
      if (user.code === dto.code) {
        user.verified = true;
        user.code = '';
        user.codeExpiresAt = undefined;
        user.updatedAt = new Date();
        const { accessToken, refreshToken } = this.generateTokens(user);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
        // console.log(this.toClientJson(user));
        return this.toClientJson(user);
      } else {
        throw new UnauthorizedException(MutipleAuthMessages.INVALID_CODE);
      }
    } catch (error) {
      console.error('verifyCodeService error:', error);
      throw error;
    }
  }

  async resendCodeService(dto: SendEmailDto) {
    // Giới hạn số lần gửi lại code trong 1 giờ (ví dụ: 5 lần)
    const MAX_RESEND_PER_HOUR = 5;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // Đếm số lần gửi lại code trong 1 giờ qua updatedAt
    const resendCount = await this.mutipleAuthModel.countDocuments({
      email: dto.email,
      updatedAt: { $gte: oneHourAgo },
    });
    if (resendCount >= MAX_RESEND_PER_HOUR) {
      throw new UnauthorizedException(MutipleAuthMessages.CODE_RESEND_LIMIT);
    }
    // Chỉ cho phép gửi lại nếu user đã tồn tại
    const user = await this.mutipleAuthModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException(MutipleAuthMessages.EMAIL_NOT_REGISTERED);
    }
    return await this.generateAndSendVerificationCode(dto.email, user);
  }

  private async checkRefreshTokenRateLimit(email: string): Promise<void> {
    //const MAX_REFRESH_PER_HOUR = 10; // Giới hạn 10 lần refresh/giờ
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Đếm số lần refresh trong 1 giờ qua (có thể lưu vào Redis hoặc cache riêng)
    // Ở đây ta check qua updatedAt field của user
    const user = await this.mutipleAuthModel.findOne({ email });
    if (user && user.updatedAt && user.updatedAt > oneHourAgo) {
      // Simplified rate limiting - in production use Redis or proper cache
      // Có thể tạo field riêng để track refresh attempts
    }
  }
}
