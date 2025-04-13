import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Res,
  Req,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendEmailDto, VerifyCodeDto } from './dto/create-auth.dto';

import {
  ApiBearerAuth,
  ApiOAuth2,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorizationGuard } from '../../common/middleware/authorization.guard';
import { Response, Request } from 'express';
import * as cookie from 'cookie'; // Thư viện cookie
import { Oauth2Guard } from 'src/common/middleware/oauth.guard';
import { TokenService } from './token.service';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private tokenService: TokenService,
  ) {}


  @Post('/SmsOtp')
  async verifyOTP(): Promise<any> {}

  @Get('/google')
  @ApiOAuth2(['email', 'profile'])
  @ApiResponse({ status: 200, description: 'Redirect to Google Auth' })
  async googleAuth(@Res() res: Response) {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const clientId = process.env.GOOGLE_CLIENT_ID; // Client ID
    const scope = 'email profile'; // Quyền truy cập cần thiết
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`;
    // access_type=offline &
    // Chuyển hướng người dùng đến trang xác thực của Google
    res.redirect(authUrl);
  }
  @Get('/google/callback')
  @ApiResponse({ status: 200, description: 'User authenticated' })
  async oauth2GoogleController(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
  ) {
    const result = await this.authService.googleLogin(code);
    const accessTokenCookie = cookie.serialize(
      'accessToken',
      result.accessToken,
      {
        maxAge: 15 * 60 * 1000, // 15 phút
      },
    );
    // const refreshTokenCookie = cookie.serialize(
    //   'refreshToken',
    //   result.refreshToken,
    //   {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'lax',
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    //     path: '/',
    //   },
    // );
    // res.cookie('accessToken', result.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'none',
    //   maxAge: 15 * 60 * 1000, // 15 phút
    //   path: '/',
    // });
    // console.log(refreshTokenCookie);
    // Set cookie vào header phản hồi
    res.setHeader('Set-Cookie', accessTokenCookie);

    res.redirect('http://localhost:3000/');
    // return { refreshTokenCookie: refreshTokenCookie };
    // return res.redirect('http://localhost:8888/api/auth/userInfo');
    // return res.redirect('http://localhost:3000/api/auth/userInfo');
  }
  @UseGuards(Oauth2Guard)
  @Get('/userInfo')
  async oauth2UserInfoController(@Req() request: Request) {
    console.log(request);
    // const cookies = cookie.parse(request.headers.cookie || '');
    // const refreshtoken = cookies['refreshToken'];
    // return await this.authService.googleUserInfo(request);
    // return {
    //   message: refreshtoken,
    // };
  }

  @Post('/SendEmail')
  async sendEmailController(@Body() sendEmailDto: SendEmailDto) {
    try {
      return await this.authService.SendEmailService(sendEmailDto);
    } catch (error: any) {
      Logger.error(error.message);
    }
  }

  @Post('/VerifyCode')
  async verifyCodeRegisterController(
    @Body() verifyCodeDto: VerifyCodeDto,
    // @Res() response: Response,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.VerifyCodeService(verifyCodeDto);

    if (result.message === 'verified') {
      return { message: result.message };
    }
    // response.cookie('accessToken', result.accessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    //   maxAge: 15 * 60 * 1000, // 15 phút
    //   path: '/',
    // });
    const accessTokenCookie = cookie.serialize(
      'accessToken',
      result.accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 phút
        path: '/', // Đảm bảo cookie có thể truy cập từ mọi route
      },
    );

    response.setHeader('Set-Cookie', accessTokenCookie);
    return {
      accessToken: result.accessToken,
    };
  }

  //
  @ApiBearerAuth()
  @UseGuards(AuthorizationGuard)
  @Post('/RefreshToken')
  async refreshTokenController(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // const accessToken = (request as any).accessToken;
    // const cookies = cookie.parse(request.headers.cookie || '');
    // const refreshtoken = cookies['accessToken'];
    const result = await this.authService.RefreshTokenService(
      (request as any).accessToken,
    );
    // console.log(result);
    const accessTokenCookie = cookie.serialize(
      'accessToken',
      result.accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 phút
        path: '/', // Đảm bảo cookie có thể truy cập từ mọi route
      },
    );
    // Set cookie vào header phản hồi
    response.setHeader('Set-Cookie', accessTokenCookie);

    return {
      accessToken: result.accessToken,
    };
  }
  @ApiBearerAuth()
  @UseGuards(AuthorizationGuard)
  @Delete('/Logout')
  async logoutController(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookies = cookie.parse(request.headers.cookie || '');
    const refreshtoken = cookies['accessToken'];
    // const refreshtoken = await request.cookies['refreshToken'];

    const logoutResult = await this.authService.LogoutService(refreshtoken);

    const clearRefreshTokenCookie = cookie.serialize('refreshToken', '', {
      maxAge: 0,
      path: '/', // Đảm bảo cookie được xóa ở mọi route
    });
    // response.clearCookie('refreshToken');
    response.setHeader('Set-Cookie', clearRefreshTokenCookie);
    return logoutResult;
  }
}
