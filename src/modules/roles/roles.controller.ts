import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';

import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from 'src/common/middleware/roles.guard';
@ApiTags('Roles')
@Controller('/api')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post('/CreateRole')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  }) // Mặc định là 1
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  }) // Mặc định là 10
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'user',
  }) // Mặc định là 'username'
  @ApiQuery({
    name: 'sort',
    required: false,
    type: Boolean,
    description: 'Sort order: true for ascending, false for descending',
    example: true,
  }) // Mặc định là true
  @Get('/GetRoles')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'user',
    @Query('sort') sort: boolean = true,
  ) {
    return await this.rolesService.findAll(page, limit, sortField, sort);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('/GetRole/:id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Patch('/UpdateRole/:id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('/DeleteRole/:id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
