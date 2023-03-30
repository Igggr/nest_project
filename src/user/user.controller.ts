import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/guards/role-guard/role-checker';
import { SameUserOrHasRoleGuard } from 'src/auth/guards/role-guard/same-user-or-has-role.guard';
import { ADMIN } from 'src/roles/roles';
import { DeleteResult } from 'typeorm';
import { User } from './entities/user-entity';
import { UserService } from './user.service';

@ApiTags('Пользователи')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }
    
    @ApiOperation({ summary: 'Получи всех пользователей' })
    @ApiResponse({ status: 200, type: [User]})
    @Get('')
    getAllUserrs() {
        return this.userService.findAll();
    }
    
    @Roles(ADMIN)
    @UseGuards(SameUserOrHasRoleGuard)
    @ApiOperation({ summary: 'Удали пользователя' })
    @ApiResponse({ status: 200, type: DeleteResult })
    @Delete('/:id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.delete(id);
    }
}
