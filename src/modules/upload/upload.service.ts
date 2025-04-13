import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GridFSBucket, ObjectId } from 'mongodb';

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
  UploadAvatarService() {}

  async DownloadFileService(id: string, res: any) {
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
}
