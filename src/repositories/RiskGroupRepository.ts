import { Repository } from "typeorm";
import { RiskGroup } from "../models";
import { AppDataSource } from "src/database";

export const RiskGroupRepository: Repository<RiskGroup> = AppDataSource.getRepository(RiskGroup);