import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from '../../drive/schemas/file.schema';
import { FolderSchema } from '../../drive/schemas/folder.schema';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'File', schema: FileSchema },
      { name: 'Folder', schema: FolderSchema },
    ]),
    AuthModule,
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
