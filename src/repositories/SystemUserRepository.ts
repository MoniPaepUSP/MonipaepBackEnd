import { Repository } from "typeorm";
import { SystemUser } from "../models/SystemUser";
import { AppDataSource } from "../database";

export const SystemUserRepository: Repository<SystemUser> = AppDataSource.getRepository(SystemUser);