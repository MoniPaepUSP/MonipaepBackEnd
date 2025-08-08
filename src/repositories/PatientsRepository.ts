import { Repository } from "typeorm";
import { Patient } from "../models/Patient";
import { AppDataSource } from "../database";

export const PatientsRepository: Repository<Patient> = AppDataSource.getRepository(Patient);