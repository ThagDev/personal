import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller';
import { PerformanceMonitoringService } from '../../common/services/performance-monitoring.service';
import { DatabaseIndexService } from '../../common/services/database-index.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PerformanceController],
  providers: [
    PerformanceMonitoringService,
    DatabaseIndexService,
    PaginationService,
  ],
  exports: [PerformanceMonitoringService, DatabaseIndexService],
})
export class PerformanceModule {}
