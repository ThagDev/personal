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
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';

import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/middleware/roles.guard';
import {
  AssignPermissionsDto,
  AssignPoliciesDto,
} from './dto/assign-permissions-policies.dto';
import { success } from '../../common/response/base-response';
@ApiTags('Roles')
@Controller('/api')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Tạo mới role',
    description:
      'Chỉ admin mới có quyền tạo role mới. Truyền thông tin role qua body.',
  })
  @Post('/CreateRole')
  create(@Body() createRoleDto: CreateRoleDto) {
    const data = this.rolesService.create(createRoleDto);
    return success(data);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Lấy danh sách role',
    description:
      'Chỉ admin mới có quyền lấy danh sách role. Hỗ trợ phân trang, sắp xếp.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'user',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: Boolean,
    description: 'Sort order: true for ascending, false for descending',
    example: true,
  })
  @Get('/GetRoles')
  async findAll(@Query() query: any) {
    // Ép kiểu page, limit về số nguyên nếu có
    if (query.page !== undefined) query.page = parseInt(query.page, 10);
    if (query.limit !== undefined) query.limit = parseInt(query.limit, 10);
    const data = await this.rolesService.findAll(query);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết role',
    description:
      'Chỉ admin mới có quyền lấy thông tin chi tiết của role theo id.',
  })
  @Get('/GetRole/:id')
  findOne(@Param('id') id: string) {
    const data = this.rolesService.findOne(id);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Cập nhật thông tin role',
    description: 'Chỉ admin mới có quyền cập nhật thông tin role theo id.',
  })
  @Put('/UpdateRole/:id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = this.rolesService.update(id, updateRoleDto);
    return success(data);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Xoá role',
    description: 'Chỉ admin mới có quyền xoá role theo id.',
  })
  @Delete('/DeleteRole/:id')
  remove(@Param('id') id: string) {
    const data = this.rolesService.remove(id);
    return success(data);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Gán permission cho role',
    description:
      'Chỉ admin mới có quyền gán danh sách permission cho role. Truyền mảng tên permission vào body.',
  })
  @Put('/AssignPermissionsToRole/:id')
  async assignPermissionsToRoleController(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const data = this.rolesService.assignPermissionsToRole(
      id,
      assignPermissionsDto.permissions,
    );
    return success(data);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Gán policy cho role',
    description:
      'Chỉ admin mới có quyền gán danh sách policy cho role. Truyền mảng tên policy vào body.',
  })
  @Put('/AssignPoliciesToRole/:id')
  async assignPoliciesToRoleController(
    @Param('id') id: string,
    @Body() assignPoliciesDto: AssignPoliciesDto,
  ) {
    const data = this.rolesService.assignPoliciesToRole(
      id,
      assignPoliciesDto.policies,
    );
    return success(data);
  }
}
