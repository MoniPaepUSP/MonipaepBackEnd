import { Repository } from 'typeorm';
import { HealthProtocol } from '../models';
import { AppDataSource } from 'src/database';

export const HealthProtocolRepository : Repository<HealthProtocol> = AppDataSource.getRepository (HealthProtocol);
