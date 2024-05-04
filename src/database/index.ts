// import {Connection, createConnection} from "typeorm"

// export default async (): Promise<Connection> =>{
//     return createConnection()
// }

import {DataSource} from 'typeorm';
import  fs from 'fs';

const {
    POSTGRES_HOST: HOST,
    POSTGRES_HOST_FILE: HOST_FILE,
    POSTGRES_USER: USER,
    POSTGRES_USER_FILE: USER_FILE,
    POSTGRES_PASSWORD: PASSWORD,
    POSTGRES_PASSWORD_FILE: PASSWORD_FILE,
    POSTGRES_DB: DB,
    POSTGRES_DB_FILE: DB_FILE,
} = process.env;


// production
    // const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    // const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    // const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE, 'utf8') : PASSWORD;
    // const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

//development
const host = "localhost"
const user = "postgres"
const password = "postgreslabesmonipaep"
const database = "monipaep"

export const AppDataSource = new DataSource({
    "type": "postgres",
    "host": `${host}`,
    "port": 5432,
    "username": `${user}`,
    "password": `${password}`,
    "database": `${database}`,
    "logging": true,
    "migrations": ["./src/database/migrations/**.ts"],
    "entities": ["./src/models/**.{ts,js}"],
    // "cli":{
    //     "migrationsDir": "./src/database/migrations"
    // }
})


// inciando banco de dados
AppDataSource.initialize()
    .then(() => {
        console.log("Data source typeorm initialized!");
        console.log(host);
        console.log(user);
        console.log(password);
        console.log(database);
        
        
    })
    .catch((err) => {
        console.error("Error on data source typeorm intialization ", err);
    })
