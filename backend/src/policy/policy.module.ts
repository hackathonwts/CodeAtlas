import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { PolicyService } from "./policy.service";
import { DiscoveryModule } from "@nestjs/core";
import { InjectConnection, InjectModel, MongooseModule } from "@nestjs/mongoose";
import { Policy, PolicyDocument, PolicySchema } from "./schemas/policy.schema";
import { Connection, Model } from "mongoose";
import { PolicyController } from "./policy.controller";

@Module({
    imports: [
        DiscoveryModule,
        MongooseModule.forFeature([
            { name: Policy.name, schema: PolicySchema }
        ])
    ],
    controllers: [PolicyController],
    providers: [PolicyService],
})
export class PolicyModule implements OnModuleInit {
    constructor(
        @InjectModel(Policy.name) private readonly policyModel: Model<PolicyDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly policyService: PolicyService
    ) { }

    async onModuleInit() {
        const discovered = this.policyService.getPermissions()
        const map = new Map<string, { resource: string; action: string }>()
        for (const p of discovered) {
            map.set(`${p.resource}:${p.action}`, p)
        }
        const unique = [...map.values()]
        const session = await this.connection.startSession()
        try {
            await session.withTransaction(async () => {
                await this.policyModel.deleteMany({})
                await this.policyModel.insertMany(unique)
            })
        } catch(error) {
            Logger.error(error)
        } finally {
            await session.endSession()
        }
    }
}