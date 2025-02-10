// import {Connection, createConnection} from "typeorm"

// export default async (): Promise<Connection> =>{
//     return createConnection()
// }

import { DataSource } from 'typeorm';
import fs from 'fs';

const {
  POSTGRES_HOST: HOST,
  POSTGRES_HOST_FILE: HOST_FILE,
  POSTGRES_USER: USER,
  POSTGRES_USER_FILE: USER_FILE,
  POSTGRES_PASSWORD: PASSWORD,
  POSTGRES_PASSWORD_FILE: PASSWORD_FILE,
  POSTGRES_DB: DB,
  POSTGRES_DB_FILE: DB_FILE,

  ENVIRONMENT_TYPE: ENVIRONMENT,
} = process.env; // reading from environment all usefull variables

// development
let host = 'localhost';
let user = 'pgdefault_user';
let password = '2706';
let database = 'monipaep';

// production
if (ENVIRONMENT == 'PRODUCTION') {
  console.log('Entering production mode');

  // reading docker secrets in case it runs on production mode
  host = (HOST_FILE ? fs.readFileSync(HOST_FILE).toString() : HOST) ?? '';
  user = (USER_FILE ? fs.readFileSync(USER_FILE).toString() : USER) ?? '';
  password = (PASSWORD_FILE
    ? fs.readFileSync(PASSWORD_FILE, 'utf8').toString()
    : PASSWORD) ?? '';
  database = (DB_FILE ? fs.readFileSync(DB_FILE).toString() : DB) ?? '';
} else {
  console.log('Production: DEVELOPMENT');
  console.log('Variables:');
  console.log(host);
  console.log(user);
  console.log(password);
  console.log(database);
}

// initializing database with typeorm
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: `${host}`,
  port: 5432,
  username: `${user}`,
  password: `${password}`,  
  database: `${database}`,
  logging: true,
  migrations: ['./src/database/migrations/**.ts'],
  entities: ['./src/models/**.{ts,js}'],
  // "cli":{
  //     "migrationsDir": "./src/database/migrations"
  // }
});

// inciando banco de dados
AppDataSource.initialize()
  .then(() => {
    console.log('Data source typeorm initialized!');
    // console.log(host);
    // console.log(user);
    // console.log(password);
    // console.log(database);
  })
  .catch((err) => {
    console.error('Error on data source typeorm intialization ', err);
  });
