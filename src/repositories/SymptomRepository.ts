import { Repository } from 'typeorm';
import { Symptom } from '../models';
import { AppDataSource } from 'src/database';

export const SymptomRepository : Repository<Symptom> = AppDataSource.getRepository (Symptom);