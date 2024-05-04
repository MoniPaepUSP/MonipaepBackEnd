import {  Repository } from "typeorm";
import { Disease } from "../models";
import { AppDataSource } from "src/database";


export const DiseaseRepository : Repository<Disease> = AppDataSource.getRepository(Disease);
