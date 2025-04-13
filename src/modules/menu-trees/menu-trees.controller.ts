import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { MenuTreesService } from './menu-trees.service';
import { CreateMenuTreeDto } from './dto/create-menu-tree.dto';
import { UpdateMenuTreeDto } from './dto/update-menu-tree.dto';
@ApiTags('MenuTrees')
@Controller('/api')
export class MenuTreesController {
  constructor(private readonly menuTreesService: MenuTreesService) {}
  @Post('/MenuCategories')
  @ApiOperation({ summary: 'menu level 1' })
  async Menu_Categories_Controller(
    @Body() createMenuTreeDto: CreateMenuTreeDto,
  ) {
    return await this.menuTreesService.Menu_Categories_Service(
      createMenuTreeDto,
    );
  }

  @Post('/MenuSubCategories/:id')
  @ApiOperation({ summary: 'menu level 2' })
  async Menu_SubCategories_Controller(
    @Param('id') id: string,
    @Body() createMenuTreeDto: CreateMenuTreeDto,
  ) {
    return await this.menuTreesService.Menu_SubCategories_Service(
      id,
      createMenuTreeDto,
    );
  }
  @Post('/ProductGroup/:id')
  @ApiOperation({ summary: 'menu level 3 ' })
  async Menu_ProductGroup_Controller(
    @Param('id') id: string,
    @Body() createMenuTreeDto: CreateMenuTreeDto,
  ) {
    return await this.menuTreesService.Menu_ProductGroup_Service(
      id,
      createMenuTreeDto,
    );
  }

  @Get('/GetMenuParents')
  async GetMenuParentsController() {
    return await this.menuTreesService.GetMenuParentsService();
  }

  @Get('/GetMenuParent:id')
  async GetMenuParentController(@Param('id') id: string) {
    return this.menuTreesService.GetMenuParentService(id);
  }

  @Put('/UpdateMenuParent:id')
  async UpdateMenuParentController(
    @Param('id') id: string,
    @Body() updateMenuTreeDto: UpdateMenuTreeDto,
  ) {
    return await this.menuTreesService.UpdateMenuParentService(
      id,
      updateMenuTreeDto,
    );
  }

  @Delete('/DeleteMenuParent:id')
  async DeleteMenuParentController(@Param('id') id: string) {
    return await this.menuTreesService.DeleteMenuParentService(id);
  }
}
