import { Body, Controller, Patch, Param, Put, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RolesPolicyService } from './roles.policy.service';
import { success } from '../../common/response/base-response';

@ApiTags('Policy & Permission')
@Controller('/api')
export class RolesPolicyController {
  constructor(private readonly rolesPolicyService: RolesPolicyService) {}

  @ApiOperation({
    summary: 'Gán permission cho policy',
    description:
      'Gán danh sách quyền (permission) cho một policy theo id. Truyền mảng tên permission vào body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['read', 'write'],
          description: 'Danh sách tên quyền (permission) muốn gán cho policy',
        },
      },
      required: ['permissions'],
    },
  })
  @Put('/AssignPermissionsToPolicy/:id')
  async assignPermissionsToPolicy(
    @Param('id') id: string,
    @Body() dto: { permissions: string[] },
  ) {
    return this.rolesPolicyService.assignPermissionsToPolicy(
      id,
      dto.permissions,
    );
  }

  @Post('assign-permissions')
  assignPermissionsToPolicyPost(
    @Body() assignPermissionsDto: any,
  ) {
    const data = this.rolesPolicyService.assignPermissionsToPolicy(
      assignPermissionsDto.id,
      assignPermissionsDto.permissions,
    );
    return success(data);
  }
}
