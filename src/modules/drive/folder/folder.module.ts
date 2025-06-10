import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderSchema } from '../schemas/folder.schema';
import { FileSchema } from '../schemas/file.schema';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Folder', schema: FolderSchema },
      { name: 'File', schema: FileSchema },
    ]),
    AuthModule,
  ],
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
