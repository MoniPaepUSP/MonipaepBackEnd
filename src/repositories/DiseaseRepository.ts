import { Repository } from 'typeorm';
import { Disease } from '../models';
import { AppDataSource } from '../database';

export const DiseaseRepository : Repository<Disease> = AppDataSource.getRepository (Disease);
