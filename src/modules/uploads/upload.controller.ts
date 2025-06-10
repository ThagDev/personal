import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Logger,
  Param,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { ObjectId } from 'mongodb';
import { success } from '../../common/response/base-response';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  private handleError(
    res: Response,
    message: string,
    statusCode: number,
    error?: Error,
  ) {
    if (error) this.logger.error(`${message}: ${error.message}`);
    res.status(statusCode).json({ message, error: error?.message });
  }
  constructor(private readonly uploadService: UploadService) {}
  @ApiBearerAuth()
  @UseGuards(AuthorizationGuard)
  @Post('/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload avatar image (converted to webp)',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and converted to webp.',
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async UploadAvatarController(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res.status(400).json({
          message: 'no file uploaded or file size exceeds the limit!',
        });
      }
      // Gọi service để upload file
      const result = await this.uploadService.uploadAvatarService(file.buffer);
      res.status(201).json({
        message: 'File uploaded and converted to webp!',
        fileId: result.fileId,
      });
    } catch (error) {
      this.handleError(res, 'Internal server error', 500, error);
    }
  }
  @Get('/image/:id')
  @ApiOperation({ summary: 'Download webp image by ID' })
  @ApiParam({ name: 'id', description: 'ID of the file to download' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully.',
    content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } },
  })
  async DownloadFileController(@Param('id') id: string, @Res() res: Response) {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }
    return await this.uploadService.DownloadFileService(id, res);
  }
  @Post('image')
  @ApiOperation({ summary: 'Upload image with url ' })
  @UseInterceptors(FileInterceptor('file'))
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    // console.log(file);
    return success(await this.uploadService.uploadFile(file, req));
    // return {
    //   filename: file.filename,
    //   id: file.id,
    // };
  }

  private readonly allowedExtensions = [
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

  private getMultiMulterOptions() {
    return {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const ext = (file.originalname.match(/\.[^.]+$/) || [
          '',
        ])[0]?.toLowerCase();
        if (this.allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB mỗi file
    };
  }

  @Post('multi')
  @ApiOperation({
    summary: 'Upload nhiều file với các định dạng cho phép (lưu GridFS)',
  })
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
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    return success(await this.uploadService.uploadMultipleFiles(files, req));
  }
}
