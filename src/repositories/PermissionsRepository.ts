import { Repository } from 'typeorm';
import { Permissions } from '../models/Permissions';
import { AppDataSource } from 'src/database';

export const PermissionsRepository : Repository<Permissions> = AppDataSource.getRepository (Permissions);