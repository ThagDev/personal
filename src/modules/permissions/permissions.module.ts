import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  providers: [PermissionsService, PaginationService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
