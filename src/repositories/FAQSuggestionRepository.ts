import { Repository } from "typeorm";
import { FAQSuggestion } from "../models/FAQSuggestion";
import { AppDataSource } from "src/database";

export const FAQSuggestionRepository: Repository<FAQSuggestion> = AppDataSource.getRepository(FAQSuggestion);