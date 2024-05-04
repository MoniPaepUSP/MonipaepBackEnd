import { Repository } from "typeorm";
import { AboutTheApp } from "../models";
import { AppDataSource } from "src/database";

export const AboutTheAppRepository : Repository<AboutTheApp> = AppDataSource.getRepository(AboutTheApp);