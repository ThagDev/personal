import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { DriveService } from './drive.service';
import { success } from '../../common/response/base-response';

@ApiTags('Drive')
@Controller('/api/drive')
@UseGuards(AuthorizationGuard)
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @ApiBearerAuth()
  @Get('contents')
  @ApiOperation({
    summary:
      'Lấy danh sách folders và files (root hoặc trong folder), hỗ trợ search, sort, phân trang',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'ID folder cha (nếu muốn lấy contents trong 1 folder)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm kiếm theo tên file/folder',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    description: 'Trường sắp xếp (vd: createdAt, name)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'asc hoặc desc',
    schema: { default: 'desc' },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Trang (mặc định 1)',
    schema: { default: 1, type: 'integer' },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng/trang (mặc định 20)',
    schema: { default: 20, type: 'integer' },
  })
  async getContents(@CurrentUserId() userId: string, @Query() query) {
    const data = await this.driveService.getContents({ ...query, userId });
    return success(data);
  }
}
