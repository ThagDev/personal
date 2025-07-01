import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Db } from 'mongodb';

@Injectable()
export class PermissionsService extends BaseService {
  protected collectionName = 'permissions';

  constructor(
    @Inject('MONGO_DB_CONNECTION') db: Db,
    paginationService: PaginationService,
  ) {
    super(db, paginationService);
  }

  async createPermission(dto: CreatePermissionDto) {
    return this.create(dto);
  }
}
