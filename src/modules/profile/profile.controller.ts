import {
  Controller,
  Get,
  Put,
  Req,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CurrentUserEmail } from 'src/common/decorators/current-user.decorator';
import { BaseController } from '../../common/response/base-controller';
import { AuthenticatedOperation } from '../../common/decorators/api.decorator';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController extends BaseController {
  constructor(private readonly profileService: ProfileService) {
    super();
  }

  @AuthenticatedOperation('Get current user profile')
  @Get('me')
  async getMe(@CurrentUserEmail() email: string) {
    const data = await this.profileService.getMe(email);
    return this.successResponse(data);
  }

  @AuthenticatedOperation('Update current user profile')
  @Put('me')
  @ApiBody({ type: CreateProfileDto })
  async updateMe(@CurrentUserEmail() email: string, @Body() updateProfileDto: CreateProfileDto) {
    const data = await this.profileService.updateMe(email, updateProfileDto);
    return this.successResponse(data);
  }

  @AuthenticatedOperation('Change password')
  @Post('change-password')
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
    return this.successResponse(data);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async forgotPassword(@Body() body: { email: string }) {
    return this.profileService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ 
    schema: { 
      properties: { 
        token: { type: 'string' }, 
        newPassword: { type: 'string' } 
      } 
    } 
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.profileService.resetPassword(body.token, body.newPassword);
  }

  @AuthenticatedOperation('Update and change avatar')
  @Post('avatar')
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.profileService.updateAvatar(file, req);
  }

  @Get('avatar/:id')
  @ApiOperation({ summary: 'Download avatar by ID' })
  @ApiParam({ name: 'id', description: 'Avatar file ID' })
  async DownloadFileController(@Param('id') id: string, @Res() res: Response) {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }
    return await this.profileService.getAvatarByIdService(id, res);
  }
}
