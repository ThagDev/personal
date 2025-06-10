import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { success } from '../../common/response/base-response';

@ApiTags('Permission')
@Controller('/api')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('/CreatePermission')
  @ApiOperation({
    summary: 'Tạo mới permission',
    description:
      'Tạo một quyền (permission) mới cho hệ thống. Truyền thông tin quyền qua body.',
  })
  createPermission(@Body() dto: CreatePermissionDto) {
    const data = this.permissionsService.createPermission(dto);
    return success(data);
  }

  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by', example: 'name' })
  @ApiQuery({ name: 'sort', required: false, type: Boolean, description: 'Sort order: true for ascending, false for descending', example: true })
  @Get('/GetPermissions')
  @ApiOperation({
    summary: 'Lấy danh sách permission',
    description: 'Lấy toàn bộ danh sách quyền (permission) trong hệ thống, hỗ trợ phân trang và sắp xếp.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  async findAll(@Query() query: any) {
    const data = await this.permissionsService.findAll(query);
    return success(data);
  }

  @Get('/GetPermission/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết permission',
    description: 'Lấy thông tin chi tiết của một quyền (permission) theo id.',
  })
  findOne(@Param('id') id: string) {
    const data = this.permissionsService.findOne(id);
    return success(data);
  }

  @Put('/UpdatePermission/:id')
  @ApiOperation({
    summary: 'Cập nhật permission',
    description: 'Cập nhật thông tin một quyền (permission) theo id.',
  })
  update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
    const data = this.permissionsService.update(id, dto);
    return success(data);
  }

  @Delete('/DeletePermission/:id')
  @ApiOperation({
    summary: 'Xoá permission',
    description: 'Xoá một quyền (permission) khỏi hệ thống theo id.',
  })
  remove(@Param('id') id: string) {
    const data = this.permissionsService.remove(id);
    return success(data);
  }
}
