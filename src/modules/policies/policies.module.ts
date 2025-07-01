import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  providers: [PoliciesService, PaginationService],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
