import { Repository } from "typeorm";
import { SystemUser } from "../models/SystemUser";
import { AppDataSource } from "src/database";

export const SystemUserRepository : Repository<SystemUser> = AppDataSource.getRepository(SystemUser);