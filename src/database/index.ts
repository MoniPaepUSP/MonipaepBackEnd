// import {Connection, createConnection} from "typeorm"

// export default async (): Promise<Connection> =>{
//     return createConnection()
// }

import { DataSource } from 'typeorm';
import fs from 'fs';
import path from "path";

const {
    POSTGRES_HOST: HOST,
    POSTGRES_USER: USER,
    POSTGRES_PASSWORD: PASSWORD,
    POSTGRES_DB: DB,

    ENVIRONMENT_TYPE: ENVIRONMENT
} = process.env; // reading from environment all usefull variables

// development
let host = "localhost"
let user = "postgres"
let password = "postgreslabesmonipaep"
let database = "monipaep"

const isProd = ENVIRONMENT === "PRODUCTION";

// production
if (isProd) {
    console.log("Entering production mode")
    host = HOST ? HOST : "localhost";
    user = USER ? USER : "postgres";
    password = PASSWORD ? PASSWORD : "postgreslabesmonipaep";
    database = DB ? DB : "monipaep";
}

const migrationsGlob = isProd
    ? path.join(__dirname, "migrations", "*.js")
    : path.join(__dirname, "migrations", "*.ts");

const entitiesGlob = isProd
    ? path.join(__dirname, "../models", "*.js")
    : path.join(__dirname, "../models", "*.ts");

// initializing database with typeorm
export const AppDataSource = new DataSource({
    "type": "postgres",
    "host": `${host}`,
    "port": 5432,
    "username": `${user}`,
    "password": `${password}`,
    "database": `${database}`,
    "logging": false,
    migrations: [migrationsGlob],
    entities: [entitiesGlob],
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
