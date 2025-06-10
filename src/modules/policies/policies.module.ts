import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
// ...add providers/controllers if needed...
@Module({
  providers: [PoliciesService],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
