import { Repository } from "typeorm"
import { USM } from "../models"
import { AppDataSource } from "../database";

export const USMRepository: Repository<USM> = AppDataSource.getRepository(USM);