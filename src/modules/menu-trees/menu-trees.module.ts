import { Module } from '@nestjs/common';
import { MenuTreesService } from './menu-trees.service';
import { MenuTreesController } from './menu-trees.controller';

@Module({
  controllers: [MenuTreesController],
  providers: [MenuTreesService],
})
export class MenuTreesModule {}
