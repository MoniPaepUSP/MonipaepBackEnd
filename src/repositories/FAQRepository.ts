import { Repository } from "typeorm";
import { FAQ } from "../models/FAQ";
import { AppDataSource } from "src/database";



export const FAQRepository : Repository<FAQ> = AppDataSource.getRepository(FAQ);