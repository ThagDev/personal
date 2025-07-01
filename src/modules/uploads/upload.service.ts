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
import { BaseService } from '../../common/services/base.service';

/**
 * Upload Service với GridFS storage tối ưu
 */
@Injectable()
export class UploadService extends BaseService {
  private readonly logger = new Logger(UploadService.name);
  protected collectionName = 'uploads'; // Required by BaseService but not used for GridFS

  // File configuration constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_BULK_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_EXTENSIONS = [
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
  private readonly ALLOWED_MIME_TYPES = [
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

  constructor(
    @Inject('MONGO_DB_CONNECTION_GridFSBucket')
    private readonly gridFSBucket: GridFSBucket,
  ) {
    super(null, null); // GridFS doesn't use the standard MongoDB connection
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File, maxSize?: number): void {
    const fileSize = maxSize || this.MAX_FILE_SIZE;
    
    if (file.size > fileSize) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${fileSize / (1024 * 1024)}MB.`
      );
    }

    const extension = this.getFileExtension(file.originalname);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(`File extension "${extension}" not allowed.`);
    }

    const detectedMime = mime.lookup(extension) || file.mimetype;
    if (!this.ALLOWED_MIME_TYPES.includes(detectedMime)) {
      throw new BadRequestException(`MIME type "${detectedMime}" not allowed.`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return (filename.match(/\.[^.]+$/) || [''])[0]?.toLowerCase();
  }

  /**
   * Generate file URL
   */
  private generateFileUrl(fileId: string, req: any, isImage = false): string {
    const host = req.headers['host'];
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const endpoint = isImage ? 'image' : 'file';
    return `${protocol}://${host}/uploads/${endpoint}/${fileId}`;
  }

  /**
   * Download file by ID - optimized
   */
  async downloadFile(id: string, res: any): Promise<void> {
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid file ID' });
      return;
    }

    try {
      const objectId = new ObjectId(id);
      const file = await this.gridFSBucket.find({ _id: objectId }).next();

      if (!file) {
        res.status(404).json({ message: 'File not found' });
        return;
      }

      res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
      res.setHeader('Content-Length', file.length);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);
      
      downloadStream.on('error', (error) => {
        this.logger.error(`File download failed for ID ${id}:`, error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'File download failed' });
        }
      });

      downloadStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error downloading file ${id}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  /**
   * Upload avatar (converted to WebP) - optimized
   */
  async uploadAvatar(buffer: Buffer): Promise<{ fileId: string }> {
    return new Promise((resolve, reject) => {
      try {
        const readableStream = Readable.from(buffer);
        const filename = `avatar-${Date.now()}.webp`;
        const uploadStream = this.gridFSBucket.openUploadStream(filename, {
          contentType: 'image/webp',
          metadata: {
            uploadedAt: new Date(),
            type: 'avatar',
          },
        });

        readableStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
          this.logger.log(`Avatar uploaded successfully: ${filename}`);
          resolve({ fileId: uploadStream.id.toString() });
        });

        uploadStream.on('error', (error) => {
          this.logger.error('Avatar upload failed:', error);
          reject(new InternalServerErrorException('Avatar upload failed'));
        });
      } catch (error) {
        this.logger.error('Avatar upload error:', error);
        reject(new InternalServerErrorException('Internal server error'));
      }
    });
  }
  /**
   * Upload single file - optimized
   */
  async uploadFile(file: Express.Multer.File, req: any): Promise<FileResponse> {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const fileId = new ObjectId();
      const writeStream = this.gridFSBucket.openUploadStreamWithId(
        fileId,
        file.originalname,
        {
          contentType: file.mimetype,
          metadata: {
            uploadedAt: new Date(),
            size: file.size,
            originalname: file.originalname,
          },
        },
      );

      writeStream.write(file.buffer);
      writeStream.end();

      writeStream.on('finish', () => {
        this.logger.log(`File uploaded: ${file.originalname} (${fileId})`);
        const isImage = file.mimetype.startsWith('image/');
        resolve({
          id: fileId.toString(),
          url: this.generateFileUrl(fileId.toString(), req, isImage),
        });
      });

      writeStream.on('error', (err) => {
        this.logger.error(`Upload failed for ${file.originalname}:`, err);
        reject(new InternalServerErrorException('File upload failed'));
      });
    });
  }

  /**
   * Upload multiple files - optimized with better error handling
   */
  async uploadMultipleFiles(files: Express.Multer.File[], req: any) {
    const concurrency = 3; // Reduced concurrency for better stability
    const uploadResults: any[] = [];

    // Process files in batches
    const processBatch = async (batch: Express.Multer.File[]) => {
      return Promise.allSettled(
        batch.map(async (file) => {
          try {
            // Validate file before upload
            this.validateFile(file, this.MAX_BULK_FILE_SIZE);
            
            const result = await this.uploadFile(file, req);
            const extension = this.getFileExtension(file.originalname);
            const isImage = file.mimetype.startsWith('image/');

            return {
              success: true,
              id: result.id,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              extension,
              isImage,
              url: result.url,
              error: null,
            };
          } catch (error) {
            this.logger.error(`Failed to upload ${file.originalname}:`, error);
            return {
              success: false,
              id: null,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              extension: this.getFileExtension(file.originalname),
              isImage: file.mimetype.startsWith('image/'),
              url: null,
              error: error.message || 'Upload failed',
            };
          }
        }),
      );
    };

    try {
      // Process files in batches with concurrency control
      for (let i = 0; i < files.length; i += concurrency) {
        const batch = files.slice(i, i + concurrency);
        const batchResults = await processBatch(batch);
        
        batchResults.forEach((result) => {
          uploadResults.push(result.status === 'fulfilled' ? result.value : {
            success: false,
            error: result.reason?.message || 'Unknown error',
          });
        });
      }

      const successful = uploadResults.filter(r => r.success).length;
      const failed = uploadResults.length - successful;

      this.logger.log(`Batch upload completed: ${successful} successful, ${failed} failed`);

      return {
        message: `Upload completed: ${successful}/${uploadResults.length} files successful`,
        summary: { total: uploadResults.length, successful, failed },
        files: uploadResults,
      };
    } catch (error) {
      this.logger.error('Critical error in batch upload:', error);
      throw new InternalServerErrorException('Batch upload failed');
    }
  }
}
