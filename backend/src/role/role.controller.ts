import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from 'src/auth/guards/abac.guard';
import { RequireAbacPolicy } from 'src/auth/decorators/abac.decorator';
import { AddPoliciesToRoleDto, RemovePoliciesFromRoleDto } from 'src/policy/dto/policy.dto';

@Controller('role')
@UseGuards(AuthGuard('jwt'), AbacGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @RequireAbacPolicy({ resource: 'role', action: 'create' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequireAbacPolicy({ resource: 'role', action: 'read' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequireAbacPolicy({ resource: 'role', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @RequireAbacPolicy({ resource: 'role', action: 'update' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequireAbacPolicy({ resource: 'role', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/policies')
  @RequireAbacPolicy({ resource: 'role', action: 'update' })
  addPolicies(@Param('id') id: string, @Body() addPoliciesToRoleDto: AddPoliciesToRoleDto) {
    return this.roleService.addPolicies(id, addPoliciesToRoleDto);
  }

  @Delete(':id/policies')
  @RequireAbacPolicy({ resource: 'role', action: 'update' })
  removePolicies(@Param('id') id: string, @Body() removePoliciesFromRoleDto: RemovePoliciesFromRoleDto) {
    return this.roleService.removePolicies(id, removePoliciesFromRoleDto);
  }
}
