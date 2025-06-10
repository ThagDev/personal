import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TokenService } from '../auth/token.service';
import { RolesPolicyService } from './roles.policy.service';
import { RolesPolicyController } from './roles.policy.controller';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  controllers: [RolesController, RolesPolicyController],
  providers: [
    RolesService,
    TokenService,
    RolesPolicyService,
    PaginationService,
  ],
})
export class RolesModule {}
