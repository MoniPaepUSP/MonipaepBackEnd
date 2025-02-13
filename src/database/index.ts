import { DataSource } from 'typeorm';
import { dbConfig } from '../config';
import logger from '../common/loggerConfig';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.DB_HOST,
  port: Number(dbConfig.DB_PORT),
  username: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_NAME,
  logging: Boolean(dbConfig.DB_LOGGING),
  synchronize: Boolean(dbConfig.DB_SYNC),
  migrations: ['./src/database/migrations/**.ts'],
  entities: ['./src/models/**.{ts,js}'],
});

AppDataSource.initialize()
  .then(() => {
    logger.info('Data source typeorm initialized!');

  })
  .catch((err) => {
    logger.error('Error on data source typeorm intialization ', err);
  });
