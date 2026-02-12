import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckAbilities } from 'src/casl/casl.decorator';
import { Action } from 'src/casl/casl-ability.factory';

@Controller('role')
@UseGuards(JwtAuthGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @CheckAbilities({ action: Action.Create, subject: 'Role' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    @CheckAbilities({ action: Action.View, subject: 'Role' })
    findAll() {
        return this.roleService.findAll();
    }

    @Get(':id')
    @CheckAbilities({ action: Action.Read, subject: 'Role' })
    findOne(@Param('id') id: string) {
        return this.roleService.findOne(id);
    }

    @Patch(':id')
    @CheckAbilities({ action: Action.Update, subject: 'Role' })
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @CheckAbilities({ action: Action.Delete, subject: 'Role' })
    remove(@Param('id') id: string) {
        return this.roleService.remove(id);
    }
}
