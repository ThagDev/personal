import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Inject,
  Logger,
  Param,
  UseGuards,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';

@ApiTags('Upload')
@Controller('/api')
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
  constructor(
    private readonly uploadService: UploadService,
    @Inject('MONGO_DB_CONNECTION_GridFSBucket')
    private readonly gridFSBucket: GridFSBucket,
  ) {}
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
      const { buffer } = file;

      const readableStream = Readable.from(buffer);

      const uploadStream = this.gridFSBucket.openUploadStream(
        `${Date.now()}.webp`, // Đặt tên file với đuôi .webp
        { contentType: 'image/webp' },
      );

      readableStream.pipe(uploadStream);

      uploadStream.on('finish', () => {
        // const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${uploadStream.id}`;
        this.logger.log(`File uploaded and converted to webp.`);
        res.status(201).json({
          message: 'File uploaded and converted to webp!',
          fileId: uploadStream.id.toString(),
          // downloadUrl,
        });
      });

      uploadStream.on('error', (error) =>
        this.handleError(res, 'File upload failed', 500, error),
      );
    } catch (error) {
      this.handleError(res, 'Internal server error', 500, error);
    }
  }
  @ApiBearerAuth()
  @UseGuards(AuthorizationGuard)
  @Get('/image/:id')
  @ApiOperation({ summary: 'Download webp image by ID' })
  @ApiParam({ name: 'id', description: 'ID of the file to download' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully.',
    content: { 'image/webp': { schema: { type: 'string', format: 'binary' } } },
  })
  async DownloadFileController(@Param('id') id: string, @Res() res: Response) {
    return await this.uploadService.DownloadFileService(id, res);
    // try {
    //   const objectId = new ObjectId(id);
    //   const file = await this.gridFSBucket.find({ _id: objectId }).next();

    //   if (!file) return this.handleError(res, 'File not found', 404);

    //   res.setHeader('Content-Type', 'image/webp'); // Đảm bảo Content-Type là webp
    //   const downloadStream = this.gridFSBucket.openDownloadStream(objectId);

    //   downloadStream
    //     .pipe(res)
    //     .on('error', (error) =>
    //       this.handleError(res, 'File download failed', 404, error),
    //     );
    // } catch (error) {
    //   this.handleError(res, 'Invalid file ID', 400, error);
    // }
  }
}
