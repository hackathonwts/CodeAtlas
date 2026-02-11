import { Controller, Get, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('policy')
@UseGuards(AuthGuard('jwt'))
export class PolicyController {
    constructor(private readonly policyService: PolicyService) {}

    @Get()
    findAll() {
        return this.policyService.findAll();
    }
}
