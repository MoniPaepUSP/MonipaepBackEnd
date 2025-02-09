import { Repository } from 'typeorm';
import { RefreshToken } from '../models';
import { AppDataSource } from 'src/database';

export const RefreshTokenRepository : Repository<RefreshToken> = AppDataSource.getRepository (RefreshToken);