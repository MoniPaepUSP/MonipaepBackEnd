import { Repository } from "typeorm";
import { RiskGroups } from "../models";
import { AppDataSource } from "src/database";

export const RiskGroupRepository: Repository<RiskGroups> = AppDataSource.getRepository(RiskGroups);