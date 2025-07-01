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
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import {
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
import { ObjectId } from 'mongodb';
import { BaseController } from '../../common/response/base-controller';
import { AuthenticatedOperation } from '../../common/decorators/api.decorator';

@ApiTags('File Uploads')
@Controller('uploads')
export class UploadController extends BaseController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {
    super();
  }

  /**
   * Static multer options for file upload validation
   */
  private static getMulterOptions(maxSize: number = 5 * 1024 * 1024) {
    const ALLOWED_EXTENSIONS = [
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

    return {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const ext = (file.originalname.match(/\.[^.]+$/) || [
          '',
        ])[0]?.toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
      limits: { fileSize: maxSize },
    };
  }

  @AuthenticatedOperation('Upload avatar image (converted to WebP)')
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
  @UseInterceptors(FileInterceptor('file', UploadController.getMulterOptions()))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded or file size exceeds the limit',
      );
    }

    const result = await this.uploadService.uploadAvatar(file.buffer);
    return this.successResponse({
      message: 'Avatar uploaded and converted to WebP successfully',
      fileId: result.fileId,
    });
  }

  @Get('/image/:id')
  @ApiOperation({ summary: 'Download file by ID' })
  @ApiParam({ name: 'id', description: 'File ID to download' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    return this.uploadService.downloadFile(id, res);
  }

  @Post('single')
  @ApiOperation({ summary: 'Upload single file' })
  @UseInterceptors(FileInterceptor('file', UploadController.getMulterOptions()))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.uploadFile(file, req);
    return this.successResponse(result);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files (max 10 files, 10MB each)' })
  @UseInterceptors(
    FilesInterceptor(
      'files',
      10,
      UploadController.getMulterOptions(10 * 1024 * 1024),
    ),
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
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const result = await this.uploadService.uploadMultipleFiles(files, req);
    return this.successResponse(result);
  }
}
