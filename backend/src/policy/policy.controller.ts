import { Controller, Get, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { AuthGuard } from '@nestjs/passport';
import { AbacGuard } from 'src/auth/guards/abac.guard';
import { RequireAbacPolicy } from 'src/auth/decorators/abac.decorator';

@Controller('policy')
@UseGuards(AuthGuard('jwt'), AbacGuard)
export class PolicyController {
    constructor(private readonly policyService: PolicyService) {}

    @Get()
    @RequireAbacPolicy({ resource: 'policy', action: 'read' })
    findAll() {
        return this.policyService.findAll();
    }
}
