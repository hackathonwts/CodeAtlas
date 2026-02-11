import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AddMemberDto, CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import type { Request } from 'express';
import { LoggedInUser } from 'src/common/logged-in-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    // Project APIs //

    @Post()
    @HttpCode(200)
    create(@Body() createProjectDto: CreateProjectDto, @LoggedInUser() user: LoggedInUser) {
        return this.projectService.create(createProjectDto, user);
    }

    @Get()
    @HttpCode(200)
    findAll(@Req() req: Request) {
        return this.projectService.findAll(req);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectService.update(id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectService.remove(id);
    }

    // Project Members APIs //

    @Post(':id/members')
    addMember(@Body() body: AddMemberDto, @Req() req: Request) {
        return this.projectService.addMember(req.params.id as string, body);
    }

    @Get(':id/members')
    getMembers(@Param('id') id: string, @Req() req: Request) {
        return this.projectService.getMembers(id, req);
    }

    @Delete(':id/members/:member_id')
    removeMember(@Param('member_id') member_id: string) {
        return this.projectService.removeMember(member_id);
    }

    @Patch(':id/members/:member_id')
    updateMemberPermission(@Param('member_id') member_id: string, @Body() body: AddMemberDto) {
        return this.projectService.updateMemberPermission(member_id, body);
    }
}
