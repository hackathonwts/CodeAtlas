import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import type { Request } from 'express';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from 'src/modules/auth/guards/abac.guard';
import { RequireAbacPolicy } from 'src/modules/auth/decorators/abac.decorator';

@Controller('project')
@UseGuards(AuthGuard('jwt'), AbacGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    // Project APIs //

    @Post()
    @HttpCode(200)
    @RequireAbacPolicy({ resource: 'project', action: 'create' })
    create(@Body() createProjectDto: CreateProjectDto, @LoggedInUser() user: LoggedInUser) {
        return this.projectService.create(createProjectDto, user);
    }

    @Get()
    @HttpCode(200)
    @RequireAbacPolicy({ resource: 'project', action: 'read' })
    findAll(@Req() req: Request) {
        return this.projectService.findAll(req);
    }

    @Get(':id')
    @RequireAbacPolicy({ resource: 'project', action: 'read' })
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }

    @Patch(':id')
    @RequireAbacPolicy({ resource: 'project', action: 'update' })
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @RequireAbacPolicy({ resource: 'project', action: 'delete' })
    remove(@Param('id') id: string) {
        return this.projectService.remove(id);
    }

    // Project Members APIs //

    @Post(':id/members')
    @RequireAbacPolicy({ resource: 'project-member', action: 'create' })
    addMember(@Body() body: AddMemberDto, @Req() req: Request) {
        return this.projectService.addMember(req.params.id as string, body);
    }

    @Get(':id/members')
    @RequireAbacPolicy({ resource: 'project-member', action: 'read' })
    getMembers(@Param('id') id: string, @Req() req: Request) {
        return this.projectService.getMembers(id, req);
    }

    @Delete(':id/members/:member_id')
    @RequireAbacPolicy({ resource: 'project-member', action: 'delete' })
    removeMember(@Param('member_id') member_id: string) {
        return this.projectService.removeMember(member_id);
    }

    @Patch(':id/members/:member_id')
    updateMemberPermission(@Param('member_id') member_id: string, @Body() body: AddMemberDto) {
        return this.projectService.updateMemberPermission(member_id, body);
    }
}
