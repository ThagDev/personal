import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MutipleAuthService } from './mutiple-auth.service';
import { CreateMutipleAuthDto } from './dto/create-mutiple-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { SendEmailDto } from './dto/send-email.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  MutipleAuthResponseDto,
  MutipleAuthMessageDto,
} from './dto/mutiple-auth-response.dto';
import { CurrentUserEmail } from 'src/common/decorators/current-user.decorator';
import { success } from '../../common/response/base-response';

@ApiTags('Mutiple Auth')
@Controller('mutiple-auth')
export class MutipleAuthController {
  constructor(private readonly mutipleAuthService: MutipleAuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: CreateMutipleAuthDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    type: MutipleAuthMessageDto,
  })
  @Post('register')
  async register(@Body() dto: CreateMutipleAuthDto) {
    const data = await this.mutipleAuthService.register(dto);
    return success(data);
  }

  @ApiOperation({ summary: 'Đăng nhập (LocalStrategy)' })
  @ApiBody({ type: CreateMutipleAuthDto })
  @ApiResponse({
    status: 200,
    description:
      'Đăng nhập thành công, trả về accessToken, refreshToken (cookie)',
    type: MutipleAuthResponseDto,
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.mutipleAuthService.loginWithUser(req.user);
    if ('refreshToken' in result && result.refreshToken) {
      this.setCookieOptions(res, result.refreshToken);
    }
    const output = { ...result };
    // Remove refreshToken from output if it exists
    if ('refreshToken' in output) {
      delete output.refreshToken;
    }
    return success(output);
  }

  @ApiOperation({ summary: 'Làm mới accessToken bằng refreshToken (cookie)' })
  @ApiResponse({
    status: 200,
    description: 'Trả về accessToken mới',
    type: MutipleAuthResponseDto,
  })
  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const result = await this.mutipleAuthService.refreshToken(refreshToken);
    if ('refreshToken' in result && result.refreshToken) {
      this.setCookieOptions(res, result.refreshToken);
    }
    const output = { ...result };
    if ('refreshToken' in output) {
      delete output.refreshToken;
    }
    return success(output);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất, xóa refreshToken (cookie)' })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
    type: MutipleAuthMessageDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @CurrentUserEmail() email: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.mutipleAuthService.logout(email);
    // Clear cookie bằng cách set empty value và maxAge = 0
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
    return { message: 'Logout successful' };
  }

  @ApiOperation({ summary: 'Gửi email xác thực (send code)' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Gửi mã xác thực về email',
    type: MutipleAuthMessageDto,
  })
  @Post('send-email')
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.mutipleAuthService.sendEmailService(dto);
  }

  @ApiOperation({ summary: 'Xác thực mã code từ email' })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công, trả về user + token',
    type: MutipleAuthResponseDto,
  })
  @Post('verify-code')
  async verifyCode(
    @Body() dto: VerifyCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.mutipleAuthService.verifyCodeService(dto);
    if ('refreshToken' in result && result.refreshToken) {
      this.setCookieOptions(res, result.refreshToken);
    }
    const output = { ...result };
    // Remove refreshToken from output if it exists
    if ('refreshToken' in output) {
      delete output.refreshToken;
    }
    return success(output);
  }

  @ApiOperation({ summary: 'Gửi lại mã xác thực (resend code)' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Gửi lại mã xác thực về email',
    type: MutipleAuthMessageDto,
  })
  @Post('resend-code')
  async resendCode(@Body() dto: SendEmailDto) {
    return this.mutipleAuthService.resendCodeService(dto);
  }

  private setCookieOptions(res: Response, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isNgrok =
      process.env.HOST?.includes('ngrok.io') ||
      process.env.HOST?.includes('ngrok-free.app');
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction || isNgrok, // HTTPS cho production hoặc ngrok
      sameSite: isProduction ? 'strict' : 'lax', // Lax để hỗ trợ cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      path: '/',
      // Có thể thêm domain nếu cần
      // domain: process.env.COOKIE_DOMAIN
    });
  }
}
