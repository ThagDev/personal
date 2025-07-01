import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Db } from 'mongodb';

/**
 * Performance Monitoring Service
 * Tracks và phân tích hiệu suất ứng dụng
 */
@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name);
  private readonly metrics = new Map<string, any>();

  constructor(@Inject('MONGO_DB_CONNECTION') private readonly db: Db) {
    this.startPerformanceMonitoring();
  }

  /**
   * Track API endpoint performance
   */
  trackEndpoint(endpoint: string, method: string, responseTime: number, status: number) {
    const key = `${method}:${endpoint}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        totalRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        successCount: 0,
        errorCount: 0,
        lastUpdated: new Date(),
      });
    }

    const metric = this.metrics.get(key);
    metric.totalRequests++;
    metric.totalResponseTime += responseTime;
    metric.averageResponseTime = metric.totalResponseTime / metric.totalRequests;
    
    if (status < 400) {
      metric.successCount++;
    } else {
      metric.errorCount++;
    }
    
    metric.lastUpdated = new Date();
    
    // Alert for slow endpoints
    if (responseTime > 1000) {
      this.logger.warn(`Slow endpoint detected: ${key} took ${responseTime}ms`);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const systemMetrics = this.getSystemMetrics();
    const endpointMetrics = Object.fromEntries(this.metrics);
    const databaseMetrics = this.getDatabaseMetrics();

    return {
      system: systemMetrics,
      endpoints: endpointMetrics,
      database: databaseMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get system performance metrics
   */
  private getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  /**
   * Get database performance metrics
   */
  private async getDatabaseMetrics() {
    try {
      const stats = await this.db.admin().serverStatus();
      const collections = ['users', 'roles', 'permissions', 'policies', 'files', 'folders'];
      
      const collectionStats = {};
      for (const collection of collections) {
        try {
          const count = await this.db.collection(collection).countDocuments();
          const sampleDoc = await this.db.collection(collection).findOne();
          
          collectionStats[collection] = {
            count,
            sampleSize: sampleDoc ? JSON.stringify(sampleDoc).length : 0,
            hasData: count > 0,
          };
        } catch (error) {
          collectionStats[collection] = { error: 'Collection not found' };
        }
      }

      return {
        connections: stats.connections,
        operations: stats.opcounters,
        memory: {
          resident: Math.round(stats.mem.resident),
          virtual: Math.round(stats.mem.virtual),
        },
        collections: collectionStats,
      };
    } catch (error) {
      return { error: 'Unable to fetch database metrics' };
    }
  }

  /**
   * Start background performance monitoring
   */
  private startPerformanceMonitoring() {
    // Monitor every 5 minutes
    setInterval(() => {
      this.logPerformanceMetrics();
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000);

    // Monitor memory every minute
    setInterval(() => {
      this.checkMemoryUsage();
    }, 60 * 1000);
  }

  /**
   * Log performance metrics
   */
  private logPerformanceMetrics() {
    const metrics = this.getMetrics();
    this.logger.log(`Performance Metrics: ${JSON.stringify(metrics.system)}`);
    
    // Alert for high memory usage
    if (metrics.system.memory.used > 500) { // > 500MB
      this.logger.warn(`High memory usage detected: ${metrics.system.memory.used}MB`);
    }
  }

  /**
   * Check memory usage and warn if high
   */
  private checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    if (heapUsedMB > 512) { // > 512MB
      this.logger.warn(`High heap usage: ${Math.round(heapUsedMB)}MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        this.logger.log('Forced garbage collection');
      }
    }
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [key, metric] of this.metrics) {
      if (metric.lastUpdated < oneDayAgo) {
        this.metrics.delete(key);
      }
    }
  }

  /**
   * Get slow queries from database profiler
   */
  async getSlowQueries(limit: number = 10) {
    try {
      const profilerData = await this.db
        .collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .sort({ ts: -1 })
        .limit(limit)
        .toArray();

      return profilerData.map(query => ({
        command: query.command,
        duration: query.millis,
        timestamp: query.ts,
        namespace: query.ns,
      }));
    } catch (error) {
      return { error: 'Unable to fetch slow queries' };
    }
  }
}
