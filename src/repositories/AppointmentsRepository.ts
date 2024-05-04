import { Repository } from "typeorm";
import { Appointment } from "../models";
import { AppDataSource } from "src/database";



export const AppointmentsRepository : Repository<Appointment> = AppDataSource.getRepository(Appointment);