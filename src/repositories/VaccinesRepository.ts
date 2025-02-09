import { Repository } from "typeorm"
import { Vaccine } from "../models"
import { AppDataSource } from "src/database";

export const VaccinesRepository : Repository<Vaccine> = AppDataSource.getRepository(Vaccine);
