import { Repository } from "typeorm";
import { SpecialCondition } from "../models";
import { AppDataSource } from "../database";

export const SpecialConditionRepository: Repository<SpecialCondition> = AppDataSource.getRepository(SpecialCondition);