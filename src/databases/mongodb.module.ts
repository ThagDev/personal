// src/database/mongodb.module.ts
import { Module, DynamicModule, Global, Logger } from '@nestjs/common';
import { MongoClient, Db, GridFSBucket } from 'mongodb';

@Global()
@Module({})
export class MongoDBModule {
  private static readonly logger = new Logger(MongoDBModule.name);
  static forRoot(
    uri: string,
    dbName: string,
    connectionName: string,
  ): DynamicModule {
    const dbProvider = {
      provide: connectionName,
      useFactory: async (): Promise<Db | null> => {
        try {
          const client = new MongoClient(uri);
          await client.connect();
          MongoDBModule.logger.log(`mongodb connected`);
          const db = client.db(dbName);
          // Tạo index cho các trường thường xuyên truy vấn
          await Promise.all([
            db.collection('auth').createIndex({ accessToken: 1 }),
            db.collection('auth').createIndex({ roles: 1 }),
            db.collection('roles').createIndex({ role: 1 }),
            db.collection('permissions').createIndex({ name: 1 }),
            db.collection('policies').createIndex({ name: 1 }),
            db.collection('files').createIndex({ name: 1 }),
            db.collection('folders').createIndex({ name: 1 }),
            db.collection('folders').createIndex({ parent: 1 }),
            db.collection('files').createIndex({ parent: 1 }),
          ]);
          MongoDBModule.logger.log(
            'Indexes created for frequently queried fields.',
          );
          return db;
        } catch (error) {
          MongoDBModule.logger.error(
            `mongodb connection error: ${error.message}`,
          );
          return null;
        }
      },
    };

    const gridFSProvider = {
      provide: `${connectionName}_GridFSBucket`,
      useFactory: async (db: Db): Promise<GridFSBucket | null> => {
        if (!db) return null;
        MongoDBModule.logger.log('GridFSBucket initialized');
        return new GridFSBucket(db, { bucketName: 'uploads' });
      },
      inject: [connectionName], // Đảm bảo GridFSBucket được khởi tạo sau khi Db kết nối thành công
    };
    return {
      module: MongoDBModule,
      providers: [dbProvider, gridFSProvider],
      exports: [dbProvider, gridFSProvider],
    };
  }
}
