import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { Db } from 'mongodb';

@Injectable()
export class RolesService extends BaseService {
  protected collectionName = 'roles';

  constructor(
    @Inject('MONGO_DB_CONNECTION') db: Db,
    paginationService: PaginationService,
  ) {
    super(db, paginationService);
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.db.collection('roles')
      .findOne({ name: createRoleDto.name });
    
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return super.create(createRoleDto);
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    return this.updateById(roleId, { permissions });
  }

  async assignPoliciesToRole(roleId: string, policies: string[]) {
    return this.updateById(roleId, { policies });
  }
}
