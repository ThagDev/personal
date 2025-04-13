import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ProfileUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/middleware/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthorizationGuard } from 'src/common/middleware/authorization.guard';

@ApiTags('Users')
@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @UseGuards(AuthorizationGuard)
  @Put('/Profile')
  async ProfileController(
    @Req() request: Request,
    @Body() profileUserDto: ProfileUserDto,
  ) {
    return this.usersService.ProfileService(request, profileUserDto);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('/GetAllUsers')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  }) // Mặc định là 1
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  }) // Mặc định là 10
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'username',
  }) // Mặc định là 'username'
  @ApiQuery({
    name: 'sort',
    required: false,
    type: Boolean,
    description: 'Sort order: true for ascending, false for descending',
    example: true,
  }) // Mặc định là true
  async findAllController(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string = 'username',
    @Query('sort') sort: boolean = true,
  ) {
    return this.usersService.findAllService(page, limit, sortField, sort);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('GetUser/:id')
  async findOneController(@Param('id') id: string) {
    return this.usersService.findOneService(id);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Put('UpdateUser/:id')
  async UpdateUserController(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.UpdateUserService(id, updateUserDto);
  }
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('DeleteUser/:id')
  async DeteletUserController(@Param('id') id: string) {
    return this.usersService.DeteletUserService(id);
  }
}
