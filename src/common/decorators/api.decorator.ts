import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../middleware/roles.guard';
import { AuthorizationGuard } from '../middleware/authorization.guard';

/**
 * Decorator kết hợp cho admin operations
 */
export function AdminOperation(summary: string) {
  return applyDecorators(
    Roles('admin'),
    UseGuards(RolesGuard),
    ApiOperation({ summary }),
    ApiBearerAuth(),
  );
}

/**
 * Decorator kết hợp cho authenticated operations
 */
export function AuthenticatedOperation(summary: string) {
  return applyDecorators(
    UseGuards(AuthorizationGuard),
    ApiOperation({ summary }),
    ApiBearerAuth(),
  );
}

/**
 * Decorator kết hợp cho pagination queries
 */
export function PaginationQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 }),
    ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' }),
    ApiQuery({ name: 'sort', required: false, type: Boolean, description: 'Sort order: true for asc, false for desc' }),
  );
}
