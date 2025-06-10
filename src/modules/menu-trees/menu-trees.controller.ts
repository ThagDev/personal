import { Controller, Get, Query } from '@nestjs/common';
import { MenuTreesService } from './menu-trees.service';
import { success } from '../../common/response/base-response';

@Controller('menu-trees')
export class MenuTreesController {
  constructor(private readonly menuTreesService: MenuTreesService) {}

  @Get()
  async GetMenuParents(@Query() query) {
    const data = await this.menuTreesService.GetMenuParentsService(query);
    return success(data);
  }
}
