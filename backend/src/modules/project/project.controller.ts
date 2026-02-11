import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import type { Request } from 'express';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckAbilities } from 'src/casl/casl.decorator';
import { Action } from 'src/casl/casl-ability.factory';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    // Project APIs //

    @Post()
    @HttpCode(200)
    @CheckAbilities({ action: Action.Create, subject: 'Project' })
    create(@Body() createProjectDto: CreateProjectDto, @LoggedInUser() user: LoggedInUser) {
        return this.projectService.create(createProjectDto, user);
    }

    @Get()
    @HttpCode(200)
    @CheckAbilities({ action: Action.View, subject: 'Project' })
    findAll(@Req() req: Request) {
        return this.projectService.findAll(req);
    }

    @Get(':id')
    @CheckAbilities({ action: Action.Read, subject: 'Project' })
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }

    @Patch(':id')
    @CheckAbilities({ action: Action.Update, subject: 'Project' })
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @CheckAbilities({ action: Action.Delete, subject: 'Project' })
    remove(@Param('id') id: string) {
        return this.projectService.remove(id);
    }

    // Project Members APIs //

    @Post(':id/members')
    @CheckAbilities({ action: Action.Create, subject: 'Member' })
    addMember(@Body() body: AddMemberDto, @Req() req: Request) {
        return this.projectService.addMember(req.params.id as string, body);
    }

    @Get(':id/members')
    @CheckAbilities({ action: Action.View, subject: 'Member' })
    getMembers(@Param('id') id: string, @Req() req: Request) {
        return this.projectService.getMembers(id, req);
    }

    @Delete(':id/members/:member_id')
    @CheckAbilities({ action: Action.Delete, subject: 'Member' })
    removeMember(@Param('member_id') member_id: string) {
        return this.projectService.removeMember(member_id);
    }

    @Patch(':id/members/:member_id')
    @CheckAbilities({ action: Action.Update, subject: 'Member' })
    updateMemberPermission(@Param('member_id') member_id: string, @Body() body: AddMemberDto) {
        return this.projectService.updateMemberPermission(member_id, body);
    }
}
