import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Db } from 'mongodb';

/**
 * Database Indexing Service - Tạo indexes tự động cho hiệu suất tối ưu
 */
@Injectable()
export class DatabaseIndexService implements OnModuleInit {
  constructor(@Inject('MONGO_DB_CONNECTION') private readonly db: Db) {}

  async onModuleInit() {
    await this.createIndexes();
  }

  private async createIndexes() {
    try {
      console.log('🚀 Creating database indexes for optimal performance...');

      // Users collection indexes
      await this.db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { username: 1 }, unique: true },
        { key: { roles: 1 } },
        { key: { createdAt: -1 } },
        { key: { email: 1, verified: 1 } }, // Compound index for login
      ]);

      // Roles collection indexes
      await this.db.collection('roles').createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { permissions: 1 } },
        { key: { policies: 1 } },
        { key: { createdAt: -1 } },
      ]);

      // Permissions collection indexes
      await this.db.collection('permissions').createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { resource: 1 } },
        { key: { action: 1 } },
        { key: { resource: 1, action: 1 } }, // Compound index
      ]);

      // Policies collection indexes
      await this.db.collection('policies').createIndexes([
        { key: { name: 1 }, unique: true },
        { key: { resources: 1 } },
        { key: { actions: 1 } },
        { key: { effect: 1 } },
      ]);

      // Categories collection indexes
      await this.db.collection('categories').createIndexes([
        { key: { name: 1 } },
        { key: { slug: 1 }, unique: true },
        { key: { parentId: 1 } },
        { key: { parentIds: 1 } },
        { key: { order: 1 } },
        { key: { parentId: 1, order: 1 } }, // Compound for tree queries
      ]);

      // Files collection indexes (Drive module)
      await this.db.collection('files').createIndexes([
        { key: { userId: 1 } },
        { key: { filename: 1 } },
        { key: { mimetype: 1 } },
        { key: { parent: 1 } },
        { key: { userId: 1, parent: 1 } }, // Compound for user's folder files
        { key: { userId: 1, filename: 'text' } }, // Text search
        { key: { createdAt: -1 } },
        { key: { size: 1 } },
        { key: { isDeleted: 1 } },
      ]);

      // Folders collection indexes (Drive module)
      await this.db.collection('folders').createIndexes([
        { key: { userId: 1 } },
        { key: { name: 1 } },
        { key: { parent: 1 } },
        { key: { userId: 1, parent: 1 } }, // Compound for user's subfolders
        { key: { userId: 1, name: 'text' } }, // Text search
        { key: { createdAt: -1 } },
        { key: { isDeleted: 1 } },
      ]);

      // Auth tokens collection indexes
      await this.db.collection('mutiple_auths').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { refreshToken: 1 } },
        { key: { accessToken: 1 } },
        { key: { verified: 1 } },
        { key: { code: 1 } },
        { key: { codeExpiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
        { key: { createdAt: -1 } },
      ]);

      // Mail logs collection indexes (if exists)
      await this.db.collection('mail_logs').createIndexes([
        { key: { to: 1 } },
        { key: { subject: 1 } },
        { key: { status: 1 } },
        { key: { createdAt: -1 } },
        { key: { createdAt: -1 }, expireAfterSeconds: 30 * 24 * 60 * 60 }, // TTL: 30 days
      ]);

      console.log('✅ Database indexes created successfully!');
    } catch (error) {
      console.error('❌ Error creating database indexes:', error);
    }
  }

  /**
   * Get index statistics for performance monitoring
   */
  async getIndexStats() {
    const collections = ['users', 'roles', 'permissions', 'policies', 'categories', 'files', 'folders'];
    const stats: any = {};

    for (const collection of collections) {
      try {
        const indexes = await this.db.collection(collection).listIndexes().toArray();
        stats[collection] = {
          indexCount: indexes.length,
          indexes: indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique || false,
          })),
        };
      } catch (error) {
        stats[collection] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Analyze slow queries and suggest optimizations
   */
  async analyzeQueries() {
    try {
      // Enable profiling for slow queries (>100ms)
      await this.db.admin().command({
        profile: 2,
        slowms: 100,
      });

      console.log('📊 Query profiling enabled for slow queries (>100ms)');
    } catch (error) {
      console.error('Error enabling query profiling:', error);
    }
  }
}
