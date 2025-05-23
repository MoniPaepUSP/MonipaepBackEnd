import { Repository } from "typeorm";
import { Comorbidity } from "../models";
import { AppDataSource } from "src/database";

export const ComorbidityRepository: Repository<Comorbidity> = AppDataSource.getRepository(Comorbidity);