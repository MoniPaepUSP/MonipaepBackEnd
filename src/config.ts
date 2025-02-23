import dotenv from 'dotenv'; 
import { ServerEnvironments } from './types/config.types';

dotenv.config ();

export const serverConfig = {
  NODE_ENV: ( process.env.NODE_ENV ?? 'development') as ServerEnvironments,
  HTTPS_SERVER_PORT: process.env.PORT ?? '443',
  HTTP_SERVER_PORT: '80'
};

export const dbConfig = {
  DB_HOST: process.env.POSTGRES_HOST ?? 'localhost',
  DB_USER: process.env.POSTGRES_USER ?? 'postgres',
  DB_PASSWORD: process.env.POSTGRES_PASSWORD ?? 'postgres',
  DB_NAME: process.env.POSTGRES_DB ?? 'monipaep',
  DB_DIALECT: process.env.DB_DIALECT ?? 'postgres',
  DB_PORT: process.env.DB_PORT ?? '5432',
  DB_SYNC: process.env.DB_SYNC ?? false,
  DB_LOGGING: process.env.DB_LOG ?? true
};

export const jwtSecret = process.env.JWT_SECRET ?? '@!@#!#';