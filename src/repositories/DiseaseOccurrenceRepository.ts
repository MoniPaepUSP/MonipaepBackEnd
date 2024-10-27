import {  Repository } from "typeorm";
import { DiseaseOccurrence } from "../models";
import { AppDataSource } from "src/database";

export const DiseaseOccurrenceRepository : Repository<DiseaseOccurrence> = AppDataSource.getRepository(DiseaseOccurrence);