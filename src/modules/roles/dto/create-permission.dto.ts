import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'read' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Quyền đọc dữ liệu' })
  @IsString()
  description?: string;
}
