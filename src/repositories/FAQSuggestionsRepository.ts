import { Repository } from 'typeorm';
import { FAQSuggestions } from '../models/FAQSuggestions';
import { AppDataSource } from 'src/database';

export const FAQSuggestionsRepository : Repository<FAQSuggestions> = AppDataSource.getRepository (FAQSuggestions);