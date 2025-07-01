import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PerformanceMonitoringService } from '../../common/services/performance-monitoring.service';
import { DatabaseIndexService } from '../../common/services/database-index.service';
import { AdminOperation } from '../../common/decorators/api.decorator';

@ApiTags('System Performance')
@Controller('api/performance')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceMonitoringService,
    private readonly databaseIndexService: DatabaseIndexService,
  ) {}

  @AdminOperation('Get system performance metrics')
  @Get('metrics')
  @ApiResponse({
    status: 200,
    description:
      'System performance metrics including memory, CPU, database stats',
  })
  async getMetrics() {
    return this.performanceService.getMetrics();
  }

  @AdminOperation('Get database index statistics')
  @Get('indexes')
  @ApiResponse({
    status: 200,
    description: 'Database index statistics for all collections',
  })
  async getIndexStats() {
    return this.databaseIndexService.getIndexStats();
  }

  @AdminOperation('Get slow database queries')
  @Get('slow-queries')
  @ApiResponse({
    status: 200,
    description: 'Recent slow database queries for optimization',
  })
  async getSlowQueries() {
    return this.performanceService.getSlowQueries();
  }

  @Get('health')
  @ApiOperation({ summary: 'Application health check' })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
  })
  async healthCheck() {
    const metrics = await this.performanceService.getMetrics();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.system.uptime,
      memory: metrics.system.memory,
      nodeVersion: metrics.system.nodeVersion,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
