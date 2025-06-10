import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['read', 'write'],
    description:
      'Danh sách permission name muốn gán cho role. Mỗi phần tử là tên quyền đã tồn tại.',
    type: [String],
    required: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];
}

export class AssignPoliciesDto {
  @ApiProperty({
    example: ['user-management', 'file-access'],
    description:
      'Danh sách policy name muốn gán cho role. Mỗi phần tử là tên policy đã tồn tại.',
    type: [String],
    required: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  policies: string[];
}
