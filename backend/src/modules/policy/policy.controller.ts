import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePolicyDto, UpdatePolicyDto, AddPoliciesToUserDto } from './dto/policy.dto';

@Controller('policy')
@UseGuards(AuthGuard('jwt'))
export class PolicyController {
    constructor(private readonly policyService: PolicyService) {}

    @Get()
    findAll() {
        return this.policyService.findAll();
    }

    @Post('rediscover')
    rediscoverPolicies() {
        return this.policyService.rediscoverPolicies();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.policyService.findOne(id);
    }

    @Post()
    create(@Body() createPolicyDto: CreatePolicyDto) {
        return this.policyService.create(createPolicyDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
        return this.policyService.update(id, updatePolicyDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.policyService.remove(id);
    }

    @Post('user/:userId')
    addPoliciesToUser(
        @Param('userId') userId: string,
        @Body() dto: AddPoliciesToUserDto
    ) {
        return this.policyService.addPoliciesToUser(userId, dto);
    }

    @Delete('user/:userId')
    removePolicesFromUser(
        @Param('userId') userId: string,
        @Body() dto: AddPoliciesToUserDto
    ) {
        return this.policyService.removePoliciesFromUser(userId, dto);
    }
}
