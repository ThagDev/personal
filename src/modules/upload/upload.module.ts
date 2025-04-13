import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TokenService } from '../auth/token.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, TokenService],
})
export class UploadModule {}
