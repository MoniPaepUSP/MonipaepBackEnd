import { Repository } from "typeorm";
import { FAQGroup } from "../models";
import { AppDataSource } from "src/database";

export const FAQGroupRepository: Repository<FAQGroup> = AppDataSource.getRepository(FAQGroup);