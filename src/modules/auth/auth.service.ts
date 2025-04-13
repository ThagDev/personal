import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SendEmailDto, VerifyCodeDto } from './dto/create-auth.dto';
import { Db } from 'mongodb';

import { TokenService } from './token.service';
import { JwtPayload } from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';

// import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @Inject('MONGO_DB_CONNECTION') private db: Db,
    private readonly mailService: MailService,
    private tokenService: TokenService,
  ) {}

  async googleLogin(code: string) {
    try {
      //console.log(code);

      // Bước 1: Gửi yêu cầu để lấy access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }).toString(),
      });

      // Kiểm tra nếu yêu cầu không thành công
      if (!tokenResponse.ok) {
        throw new UnauthorizedException({ message: 'Access token is invalid' });
      }

      const tokenData = await tokenResponse.json();
      // console.log(tokenData);
      const { access_token } = tokenData;

      //console.log(tokenData); // In ra thông tin token

      // Bước 2: Lấy thông tin người dùng từ Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user = await userInfoResponse.json();
      //console.log(user);
      // Bước 3: Lưu refresh token vào MongoDB

      // Bước 4: Tạo access token
      const accessToken = this.tokenService.generateAccessToken(
        user.id,
        user.email,
        user.name,
        user.picture,
        ['user'],
      );
      const refreshToken = this.tokenService.generateRefreshToken(
        user.id,
        user.email,
      );
      await this.db.collection('auth').updateOne(
        { email: user.email },
        {
          $set: {
            refreshToken: refreshToken || '',
            accessToken: accessToken || '',
            username: user.name || '',
            avatar: user.picture || '',
            roles: ['user'],
          },
        },
        { upsert: true },
      );
      return {
        accessToken: accessToken,
      };
      // return res.redirect('http://localhost:3000/');
    } catch (error) {
      console.error('Error retrieving access token:', error); // Log lỗi
      throw new Error('Failed to authenticate with Google');
    }
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit random code
  }

  async SendEmailService(sendEmailDto: SendEmailDto) {
    const code = this.generateCode();

    // Kiểm tra email đã tồn tại hay chưa
    const existingRecord = await this.db
      .collection('auth')
      .findOne({ email: sendEmailDto.email });

    // Nếu email đã tồn tại, chỉ cập nhật mã xác thực
    if (existingRecord) {
      const result = await this.db.collection('auth').updateOne(
        { email: sendEmailDto.email },
        {
          $set: {
            code: code,
            verified: false,
            updatedAt: new Date(),
          },
        },
      );

      await this.mailService.SendEmailNodemailer(sendEmailDto.email, code);

      if (result.modifiedCount > 0) {
        return true;
      } else {
        throw new Error('Failed to update verification code');
      }

      // Nếu email chưa tồn tại, thêm một tài liệu mới
    } else {
      const result = await this.db.collection('auth').insertOne({
        email: sendEmailDto.email,
        username: '',
        avatar: '',
        roles: ['user'],
        code: code,
        verified: false,
        accessToken: '',
        refreshToken: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.mailService.SendEmailNodemailer(sendEmailDto.email, code);

      if (result.insertedId) {
        return true;
      } else {
        throw new Error('Failed to insert new document');
      }
    }
  }

  async VerifyCodeService(verifyCodeDto: VerifyCodeDto) {
    const existingRecord = await this.db
      .collection('auth')
      .findOne({ email: verifyCodeDto.email });

    if (!existingRecord) {
      return { message: 'email not found' };
    }

    if (existingRecord.verified) {
      return { message: 'verified' };
    }

    if (existingRecord.code === verifyCodeDto.code) {
      const accessToken = this.tokenService.generateAccessToken(
        existingRecord._id.toString(),
        existingRecord.email,
        existingRecord.username,
        existingRecord.avatar,
        existingRecord.roles,
      );
      const refreshToken = this.tokenService.generateRefreshToken(
        existingRecord._id.toString(),
        existingRecord.email,
      );

      const result = await this.db.collection('auth').updateOne(
        { email: verifyCodeDto.email },
        {
          $set: {
            verified: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            updatedAt: new Date(),
          },
        },
      );
      if (result.modifiedCount > 0) {
        return {
          _id: existingRecord._id.toString(),
          accessToken: accessToken,
        };
      }
    } else {
      return { message: 'Invalid verification code' };
    }
  }

  async RefreshTokenService(token: string) {
    const dbAuth = this.db.collection('auth');
    if (!token) throw new NotFoundException('token not found');

    const findId = await dbAuth.findOne({ accessToken: token });

    // const findRefreshToken = await dbAuth.findOne({
    //   _id: findId._id,
    // });
    // const decodedRefreshToken = await this.tokenService.verifyRefreshToken(
    //   findId.refreshToken,
    // );

    // const { email } = decodedRefreshToken as JwtPayload;

    // const user = await this.db.collection('auth').findOne({ email: email });
    // if (!user) throw new UnauthorizedException('User not found');

    const generateNewAccessToken = this.tokenService.generateAccessToken(
      findId._id.toString(),
      findId.email,
      findId.username,
      findId.avatar,
      findId.roles,
    );

    const result = await this.db.collection('auth').updateOne(
      { email: findId.email },
      {
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount > 0) {
      return {
        _id: findId._id,
        accessToken: generateNewAccessToken,
        refreshToken: findId.refreshToken,
      };
    } else {
      throw new BadRequestException({ message: 'Failed to update document' });
    }
  }
  catch(error: any) {
    if (
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException
    ) {
      throw error; // Ném lỗi ra ngoài controller
    } else {
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async LogoutService(refreshtoken: string) {
    if (!refreshtoken) {
      return { message: `You are already logged out ` };
    }
    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshtoken);
    if (!decodedRefreshToken) return { message: 'Invalid refresh token' };
    const result = await this.db.collection('auth').updateOne(
      { email: (decodedRefreshToken as JwtPayload).email },
      {
        $set: {
          accessToken: '',
          refreshToken: '',
          updatedAt: new Date(),
        },
      },
    );
    if (result.modifiedCount > 0) {
      return { message: 'Logout successful' };
    } else {
      throw new Error('Failed to logout');
    }
  }
}
