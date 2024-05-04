import { Repository } from "typeorm";
import { PatientMovementHistory } from "../models";
import { AppDataSource } from "src/database";


export const PatientMovementHistoryRepository : Repository<PatientMovementHistory> = AppDataSource.getRepository(PatientMovementHistory);