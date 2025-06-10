import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { success } from 'src/common/response/base-response';

@ApiTags('Folder')
@Controller('/api/folder')
@UseGuards(AuthorizationGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo folder mới' })
  @ApiResponse({ status: 201, description: 'Tạo folder thành công, trả về thông tin folder.' })
  async create(@Body() createFolderDto: CreateFolderDto, @CurrentUserId() userId: string) {
    const data = await this.folderService.createFolder(createFolderDto, userId);
    return success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin folder theo id' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin folder.' })
  async getById(@Param('id') id: string, @CurrentUserId() userId: string) {
    const data = await this.folderService.getFolderById(id, userId);
    return success(data);
  }

  @Get(':id/contents')
  @ApiOperation({ summary: 'Lấy danh sách folder con và file con trong folder' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách folder con và file con.' })
  async getContents(@Param('id') id: string, @CurrentUserId() userId: string) {
    const data = await this.folderService.getFolderContents(id, userId);
    return success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin folder' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công, trả về thông tin folder.' })
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @CurrentUserId() userId: string,
  ) {
    const data = await this.folderService.updateFolder(id, updateFolderDto, userId);
    return success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Chuyển folder vào thùng rác (soft delete)' })
  @ApiResponse({ status: 200, description: 'Folder đã được chuyển vào thùng rác.' })
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.folderService.deleteFolder(id, userId);
    return success(null, 'Folder deleted');
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách folder gốc (root) của user' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách folder root.' })
  async getRootFolders(@Query('root') root: string, @CurrentUserId() userId: string) {
    if (root === 'true') {
      const data = await this.folderService.getRootFolders(userId);
      return success(data);
    }
    throw new BadRequestException('Use root=true to get root folders');
  }

  @Get('trash')
  @ApiOperation({ summary: 'Lấy danh sách folder trong thùng rác' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách folder đã xóa (trong thùng rác).' })
  async getTrashedFolders(@CurrentUserId() userId: string) {
    const data = await this.folderService.getTrashedFolders(userId);
    return success(data);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục folder từ thùng rác' })
  @ApiResponse({ status: 200, description: 'Khôi phục folder thành công.' })
  async restore(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.folderService.restoreFolder(id, userId);
    return success(null, 'Folder restored');
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Xóa vĩnh viễn folder khỏi hệ thống (hard delete)' })
  @ApiResponse({ status: 200, description: 'Folder đã bị xóa vĩnh viễn.' })
  async hardDelete(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.folderService.hardDeleteFolder(id, userId);
    return success(null, 'Folder permanently deleted');
  }
}
