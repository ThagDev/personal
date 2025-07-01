import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  AssignPermissionsDto,
  AssignPoliciesDto,
} from './dto/assign-permissions-policies.dto';
import { BaseController } from '../../common/response/base-controller';
import {
  AdminOperation,
  PaginationQueries,
} from '../../common/decorators/api.decorator';

@ApiTags('Roles')
@Controller('/api')
export class RolesController extends BaseController {
  constructor(private readonly rolesService: RolesService) {
    super();
  }

  @AdminOperation('Tạo mới role')
  @Post('/CreateRole')
  async create(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.rolesService.create(createRoleDto);
    return this.successResponse(data);
  }

  @AdminOperation('Lấy danh sách role')
  @PaginationQueries()
  @Get('/GetRoles')
  async findAll(@Query() query: any) {
    const parsedQuery = this.parseQuery(query);
    const data = await this.rolesService.findAll(parsedQuery);
    return this.successResponse(data);
  }

  @AdminOperation('Lấy chi tiết role')
  @Get('/GetRole/:id')
  async findOne(@Param('id') id: string) {
    const data = await this.rolesService.findById(id);
    return this.successResponse(data);
  }

  @AdminOperation('Cập nhật role')
  @Put('/UpdateRole/:id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.rolesService.updateById(id, updateRoleDto);
    return this.successResponse(data);
  }

  @AdminOperation('Xóa role')
  @Delete('/DeleteRole/:id')
  async remove(@Param('id') id: string) {
    const data = await this.rolesService.deleteById(id);
    return this.successResponse(data);
  }

  @AdminOperation('Gán permissions cho role')
  @Post('/AssignPermissionsToRole/:id')
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const data = await this.rolesService.assignPermissionsToRole(
      id,
      assignPermissionsDto.permissions,
    );
    return this.successResponse(data);
  }

  @AdminOperation('Gán policies cho role')
  @Post('/AssignPoliciesToRole/:id')
  async assignPolicies(
    @Param('id') id: string,
    @Body() assignPoliciesDto: AssignPoliciesDto,
  ) {
    const data = await this.rolesService.assignPoliciesToRole(
      id,
      assignPoliciesDto.policies,
    );
    return this.successResponse(data);
  }
}
