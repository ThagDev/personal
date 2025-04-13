import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TokenService } from '../auth/token.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, TokenService],
})
export class RolesModule {}
