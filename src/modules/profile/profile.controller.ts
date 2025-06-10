import {
  Controller,
  Get,
  Patch,
  Req,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProfileService } from './profile.service';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CurrentUserEmail } from 'src/common/decorators/current-user.decorator';
import { success } from '../../common/response/base-response';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @UseGuards(AuthorizationGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUserEmail() email: string) {
    const data = await this.profileService.getMe(email);
    return success(data);
  }
  @UseGuards(AuthorizationGuard)
  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    type: CreateProfileDto,
  })
  @UseGuards(AuthorizationGuard)
  async updateMe(@CurrentUserEmail() email: string, @Body() updateProfileDto: CreateProfileDto) {
    const data = await this.profileService.updateMe(email, updateProfileDto);
    return success(data);
  }
  @UseGuards(AuthorizationGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({
    schema: {
      properties: {
        oldPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  async changePassword(
    @CurrentUserEmail() email: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const data = await this.profileService.changePassword(
      email,
      body.oldPassword,
      body.newPassword,
    );
    return success(data);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async forgotPassword(@Body() body: { email: string }) {
    return this.profileService.forgotPassword(body.email);
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ schema: { properties: { token: { type: 'string' }, newPassword: { type: 'string' } } } })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.profileService.resetPassword(body.token, body.newPassword);
  }
  @UseGuards(AuthorizationGuard)
  @Post('avatar')
  @ApiOperation({ summary: 'update and change avatar' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  // )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.profileService.updateAvatar(file, req);
  }

  @Get('/avatar/:id')
  @ApiOperation({ summary: 'Download avatar image by ID' })
  @ApiParam({ name: 'id', description: 'ID of the avatar to download' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully.',
    content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } },
  })
  async DownloadFileController(@Param('id') id: string, @Res() res: Response) {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }
    return await this.profileService.getAvatarByIdService(id, res);
  }
}
