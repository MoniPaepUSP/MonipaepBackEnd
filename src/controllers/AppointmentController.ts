import { Request, Response } from 'express';
import { AppointmentsRepository, PatientsRepository } from '../repositories';



class AppointmentController {
  

  async create(request: Request, response: Response) {
    const body = request.body
        

    const patientExists = await PatientsRepository.findOne (
      {
        where :{
          id : body.patient_id
        }
      })

    if(!patientExists) {
      return response.status (404).json ({
        error: 'Invalid patient id, patient not found'
      })
    }

    const appointment = AppointmentsRepository.create (body)

    await AppointmentsRepository.save (appointment)

    return response.status (201).json (appointment)
  }
}

export { AppointmentController }