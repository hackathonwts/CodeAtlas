import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('policy')
@UseGuards(JwtAuthGuard)
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
}
