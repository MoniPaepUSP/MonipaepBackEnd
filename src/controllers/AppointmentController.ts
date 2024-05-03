import { Request, Response } from "express";
// import { AppointmentsRepository, PatientsRepository } from "../repositories";
import { Appointment, Patient } from "src/models";
import { AppDataSource } from "src/database";
import { Repository } from "typeorm";


class AppointmentController {
    private appointmentsRepository : Repository<Appointment>;
    private patientsRepository : Repository<Patient>;

    constructor() {
        this.appointmentsRepository = AppDataSource.getRepository(Appointment);
        this.patientsRepository = AppDataSource.getRepository(Patient);
    }

    async create(request: Request, response: Response){
        const body = request.body
        

        const patientExists = await this.patientsRepository.findOne(
            {
                where :{
                    id : body.patient_id
                }
        })

        if(!patientExists){
            return response.status(404).json({
                error: "Invalid patient id, patient not found"
            })
        }

        const appointment = this.appointmentsRepository.create(body)

        await this.appointmentsRepository.save(appointment)

        return response.status(201).json(appointment)
    }
}

export {AppointmentController}