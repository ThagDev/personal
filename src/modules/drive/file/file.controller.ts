import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Req,
} from '@nestjs/common';
import { FileService } from './file.service';
import { UpdateFileDto } from './dto/update-file.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthorizationGuard } from '../../../common/middleware/authorization.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Response } from 'express';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { success } from '../../../common/response/base-response';

@ApiTags('File')
@Controller('/api/file')
@UseGuards(AuthorizationGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiBearerAuth()
  @Get('root')
  @ApiOperation({
    summary: 'Lấy danh sách file root (không thuộc folder nào) của user',
  })
  async getRootFiles(@CurrentUserId() userId: string, @Query() query) {
    const data = await this.fileService.getRootFiles(userId, query);
    return success(data);
  }

  @ApiBearerAuth()
  @Get('folder/:folderId')
  @ApiOperation({ summary: 'Lấy danh sách file trong folder (theo userId)' })
  async getFilesInFolder(
    @Param('folderId') folderId: string,
    @CurrentUserId() userId: string,
  ) {
    const data = await this.fileService.getFilesInFolder(folderId, userId);
    return success(data);
  }

  @ApiBearerAuth()
  @Get('metadata/:id')
  @ApiOperation({ summary: 'Lấy metadata file GridFS theo userId' })
  async getFileMetadata(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ) {
    const data = await this.fileService.getFileMetadata(id, userId);
    return success(data);
  }

  @ApiBearerAuth()
  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm file theo tên (chỉ trả về file của user)',
  })
  async searchFile(
    @Query('name') name: string,
    @CurrentUserId() userId: string,
  ) {
    const data = await this.fileService.searchFileByName(name, userId);
    return success(data);
  }

  @ApiBearerAuth()
  @Get('download/:id')
  @ApiOperation({ summary: 'Download file từ GridFS theo userId' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully.' })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Res() res: Response,
  ) {
    return this.fileService.downloadFile(id, userId, res);
  }

  @ApiBearerAuth()
  @Post('upload-multi')
  @ApiOperation({ summary: 'Upload nhiều file (GridFS, gắn userId)' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const ext = (file.originalname.match(/\.[^.]+$/) || [
          '',
        ])[0]?.toLowerCase();
        const allowed = [
          '.txt',
          '.doc',
          '.docx',
          '.pdf',
          '.ppt',
          '.pptx',
          '.xls',
          '.xlsx',
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.bmp',
          '.webp',
          '.svg',
        ];
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công, trả về metadata từng file.',
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUserId() userId: string,
    @Req() req: any,
  ) {
    return this.fileService.uploadMultipleFiles(files, userId, req);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.fileService.update(id, updateFileDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.fileService.remove(id, userId);
    return { message: 'File deleted successfully' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUserId() userId: string) {
    return await this.fileService.findOne(id, userId);
  }

  @Get('trash')
  @ApiOperation({ summary: 'Lấy danh sách file trong thùng rác' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách file đã xóa (trong thùng rác).',
  })
  async getTrashedFiles(@CurrentUserId() userId: string) {
    const data = await this.fileService.getTrashedFiles(userId);
    return success(data);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục file từ thùng rác' })
  @ApiResponse({ status: 200, description: 'Khôi phục file thành công.' })
  async restore(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.fileService.restoreFile(id, userId);
    return success(null, 'File restored');
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Xóa vĩnh viễn file khỏi hệ thống (hard delete)' })
  @ApiResponse({ status: 200, description: 'File đã bị xóa vĩnh viễn.' })
  async hardDelete(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.fileService.hardDeleteFile(id, userId);
    return success(null, 'File permanently deleted');
  }
}
