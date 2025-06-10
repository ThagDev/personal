import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { FileResponse } from './types/file.interdace';
import * as mime from 'mime-types';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  // private handleError(
  //   res: Response,
  //   message: string,
  //   statusCode: number,
  //   error?: Error,
  // ) {
  //   if (error) this.logger.error(`${message}: ${error.message}`);
  //   res.status(statusCode).json({ message, error: error?.message });
  // }
  constructor(
    @Inject('MONGO_DB_CONNECTION_GridFSBucket')
    private readonly gridFSBucket: GridFSBucket,
  ) {}

  async DownloadFileService(id: string, res: any) {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid file id' });
      return;
    }
    try {
      const objectId = new ObjectId(id);
      const file = await this.gridFSBucket.find({ _id: objectId }).next();

      if (!file)
        throw new InternalServerErrorException({
          message: 'File download failed',
          error: 'File not found',
        });

      res.setHeader('Content-Type', 'image/webp'); // Đảm bảo Content-Type là webp
      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);

      downloadStream.pipe(res).on(
        'error',
        (error: any) => {
          throw new InternalServerErrorException({
            message: 'File download failed',
            error: error,
          });
        },
        // this.handleError(res, 'File download failed', 404, error),
      );
    } catch (error) {
      // this.handleError(res, 'Invalid file ID', 400, error);
      throw new InternalServerErrorException({
        message: 'Invalid file ID',
        error: error,
      });
    }
  }

  async uploadAvatarService(buffer: Buffer): Promise<{ fileId: string }> {
    return new Promise((resolve, reject) => {
      try {
        const readableStream = Readable.from(buffer);
        const uploadStream = this.gridFSBucket.openUploadStream(
          `${Date.now()}.webp`,
          { contentType: 'image/webp' },
        );
        readableStream.pipe(uploadStream);
        uploadStream.on('finish', () => {
          this.logger.log(`File uploaded and converted to webp.`);
          resolve({ fileId: uploadStream.id.toString() });
        });
        uploadStream.on('error', (error: any) => {
          this.logger.error('File upload failed', error);
          reject(
            new InternalServerErrorException({
              message: 'File upload failed',
              error: error?.message,
            }),
          );
        });
      } catch (error) {
        this.logger.error('Internal server error', error);
        reject(
          new InternalServerErrorException({
            message: 'Internal server error',
            error: error?.message,
          }),
        );
      }
    });
  }
  async uploadFile(file: Express.Multer.File, req: any): Promise<FileResponse> {
    // this.logger.log(`Uploading file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      // this.logger.warn(`File too large: ${file.originalname}`);
      throw new BadRequestException(
        'File size exceeds the maximum limit of 5MB.',
      );
    }
    // Kiểm tra loại file dựa vào đuôi file bằng mime-types
    const extension = (file.originalname.match(/\.[^.]+$/) || [
      '',
    ])[0]?.toLowerCase();
    const allowedExtensions = [
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
    if (!allowedExtensions.includes(extension)) {
      // this.logger.warn(`File extension not allowed: ${file.originalname}, ext: ${extension}`);
      throw new BadRequestException('File extension not allowed.');
    }
    const allowedMimeTypes = [
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml',
    ];
    const detectedMime = mime.lookup(extension) || file.mimetype;
    if (!allowedMimeTypes.includes(detectedMime)) {
      // this.logger.warn(`Mime type not allowed: ${file.originalname}, detected: ${detectedMime}`);
      throw new BadRequestException('Mime type not allowed.');
    }
    return new Promise((resolve, reject) => {
      const fileId = new ObjectId();
      const writeStream = this.gridFSBucket.openUploadStreamWithId(
        fileId,
        file.originalname,
        {
          contentType: file.mimetype,
        },
      );
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => {
        const host = req.headers['host'];
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        // this.logger.log(`File uploaded: ${file.originalname}, id: ${fileId}`);
        resolve({
          id: fileId.toString(),
          url: `${protocol}://${host}/uploads/image/${fileId}`,
        });
      });
      writeStream.on('error', (err) => {
        // this.logger.error(`Error uploading file: ${file.originalname}`, err);
        reject(err);
      });
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[], req: any) {
    // this.logger.log(`Uploading multiple files: ${files.map(f => f.originalname).join(', ')}`);
    const host = req.headers['host'];
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const concurrency = 5;
    const uploadResults: any[] = [];
    // Helper: batch upload with concurrency
    async function batchUpload(arr, batchSize, handler) {
      let idx = 0;
      while (idx < arr.length) {
        const batch = arr.slice(idx, idx + batchSize);
        const results = await Promise.all(batch.map(handler));
        uploadResults.push(...results);
        idx += batchSize;
      }
    }
    try {
      await batchUpload(files, concurrency, async (file) => {
        try {
          const result = await this.uploadFile(file, req);
          const isImage = file.mimetype.startsWith('image/');
          const extension = (file.originalname.match(/\.[^.]+$/) || [
            '',
          ])[0]?.toLowerCase();
          return {
            id: result.id,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            extension,
            isImage,
            url: isImage
              ? `${protocol}://${host}/uploads/image/${result.id}`
              : undefined,
            error: null,
          };
        } catch (err) {
          // this.logger.error(`Failed to upload file: ${file.originalname}`, err);
          return {
            id: null,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            extension: (file.originalname.match(/\.[^.]+$/) || [
              '',
            ])[0]?.toLowerCase(),
            isImage: file.mimetype.startsWith('image/'),
            url: undefined,
            error: err?.message || 'Unknown error',
          };
        }
      });
      // this.logger.log('Upload results:', JSON.stringify(uploadResults, null, 2));
      return {
        message: 'Upload thành công',
        files: uploadResults,
      };
    } catch (err) {
      this.logger.error('Critical error in uploadMultipleFiles', err);
      throw new InternalServerErrorException(
        err?.message || 'Internal server error',
      );
    }
  }
}
