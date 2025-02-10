import { Repository } from 'typeorm';
import { Appointment } from '../models';
import { AppDataSource } from '../database';

export const AppointmentsRepository : Repository<Appointment> = AppDataSource.getRepository (Appointment);