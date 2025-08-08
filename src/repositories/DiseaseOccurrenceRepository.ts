import { Repository } from "typeorm";
import { DiseaseOccurrence } from "../models";
import { AppDataSource } from "../database";

export const DiseaseOccurrenceRepository: Repository<DiseaseOccurrence> = AppDataSource.getRepository(DiseaseOccurrence);