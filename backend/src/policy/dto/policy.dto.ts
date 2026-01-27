import { PartialType } from "@nestjs/mapped-types";
import { IPolicy, IPolicyConditions } from "../policy.interface";
import { IsOptional } from "class-validator";

export class AddPoliciesToRoleDto {
    @IsOptional()
    policies: IPolicy[];
}

export class RemovePoliciesFromRoleDto extends PartialType(AddPoliciesToRoleDto) {}