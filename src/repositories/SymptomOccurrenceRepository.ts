import { Repository } from 'typeorm';
import { SymptomOccurrence } from '../models';
import { AppDataSource } from '../database';

export const SymptomOccurrenceRepository : Repository<SymptomOccurrence> = AppDataSource.getRepository (SymptomOccurrence);