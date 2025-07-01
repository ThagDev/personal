import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { BaseController } from '../../common/response/base-controller';

@ApiTags('Permission')
@Controller('/api')
export class PermissionsController extends BaseController {
  constructor(private readonly permissionsService: PermissionsService) {
    super();
  }

  @Post('/CreatePermission')
  @ApiOperation({ summary: 'Tạo mới permission' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    const data = await this.permissionsService.createPermission(dto);
    return this.successResponse(data);
  }

  @Get('/GetPermissions')
  @ApiOperation({ summary: 'Lấy danh sách permission' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: any) {
    const parsedQuery = this.parseQuery(query);
    const data = await this.permissionsService.findAll(parsedQuery);
    return this.successResponse(data);
  }

  @Get('/GetPermission/:id')
  @ApiOperation({ summary: 'Lấy chi tiết permission' })
  async findOne(@Param('id') id: string) {
    const data = await this.permissionsService.findById(id);
    return this.successResponse(data);
  }

  @Put('/UpdatePermission/:id')
  @ApiOperation({ summary: 'Cập nhật permission' })
  async update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
    const data = await this.permissionsService.updateById(id, dto);
    return this.successResponse(data);
  }

  @Delete('/DeletePermission/:id')
  @ApiOperation({ summary: 'Xóa permission' })
  async remove(@Param('id') id: string) {
    const data = await this.permissionsService.deleteById(id);
    return this.successResponse(data);
  }
}
