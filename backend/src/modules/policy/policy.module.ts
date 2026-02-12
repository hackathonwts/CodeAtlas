import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { DiscoveryModule } from '@nestjs/core';
import { InjectConnection, InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicyDocument, PolicySchema } from './schemas/policy.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Connection, Model } from 'mongoose';
import { PolicyController } from './policy.controller';

@Module({
    imports: [
        DiscoveryModule,
        MongooseModule.forFeature([
            { name: Policy.name, schema: PolicySchema },
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
        ])
    ],
    controllers: [PolicyController],
    providers: [PolicyService],
    exports: [PolicyService],
})
export class PolicyModule implements OnModuleInit {
    constructor(
        @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly policyService: PolicyService,
    ) { }

    async onModuleInit() {
        const discovered = this.policyService.getPermissions();
        const map = new Map<string, { subject: string; action: string }>();
        for (const p of discovered) {
            map.set(`${p.subject}:${p.action}`, p);
        }
        const unique = [...map.values()];

        const existingCount = await this.policyModel.countDocuments();
        if (existingCount > 0) {
            Logger.log('Policies already exist, skipping auto-discovery seed');
            return;
        }

        const session = await this.connection.startSession();
        try {
            await session.withTransaction(async () => {
                const policiesToInsert = unique.map(p => ({
                    action: p.action,
                    subject: p.subject,
                    inverted: false,
                    reason: `Auto-discovered from ${p.subject} controller`,
                    is_active: true
                }));

                policiesToInsert.push({
                    action: 'manage',
                    subject: 'all',
                    inverted: false,
                    reason: 'Default policy to allow managing all resources',
                    is_active: false
                })

                await this.policyModel.insertMany(policiesToInsert);
                Logger.log(`Seeded ${policiesToInsert.length} auto-discovered policies`);
            });
        } catch (error) {
            Logger.error('Error seeding policies:', error);
        } finally {
            await session.endSession();
        }
    }
}
