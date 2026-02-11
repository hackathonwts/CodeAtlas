import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AddPoliciesToRoleDto, RemovePoliciesFromRoleDto } from 'src/modules/policy/dto/policy.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('role')
@UseGuards(JwtAuthGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    findAll() {
        return this.roleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.roleService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roleService.remove(id);
    }

    @Post(':id/policies')
    addPolicies(@Param('id') id: string, @Body() addPoliciesToRoleDto: AddPoliciesToRoleDto) {
        return this.roleService.addPolicies(id, addPoliciesToRoleDto);
    }

    @Delete(':id/policies')
    removePolicies(@Param('id') id: string, @Body() removePoliciesFromRoleDto: RemovePoliciesFromRoleDto) {
        return this.roleService.removePolicies(id, removePoliciesFromRoleDto);
    }
}
