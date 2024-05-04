import {  Repository } from "typeorm";
import { AssignedHealthProtocol } from "../models/AssignedHealthProtocol";
import { AppDataSource } from "src/database";


export const AssignedHealthProtocolRepository : Repository<AssignedHealthProtocol> = AppDataSource.getRepository(AssignedHealthProtocol);