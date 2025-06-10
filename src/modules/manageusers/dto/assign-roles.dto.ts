import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({
    example: ['admin', 'user'],
    description:
      'Danh sách role name muốn gán cho user. Mỗi phần tử là tên role đã tồn tại trong hệ thống.',
    type: [String],
    required: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];
}
