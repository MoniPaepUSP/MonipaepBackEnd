import { Repository } from "typeorm";
import { FAQ } from "../models";
import { AppDataSource } from "../database";

export const FAQRepository: Repository<FAQ> = AppDataSource.getRepository(FAQ);