import { Request, Response } from "express";
import { Patient, USM, Vaccine } from "../models";
// import { Repository } from "typeorm";
// import { AppDataSource } from "src/database";
import { PatientsRepository, USMRepository, VaccinesRepository } from "../repositories";

class VaccineController{
  
  async create(request: Request, response:Response){
    const body = request.body

  

    const patientExists = await PatientsRepository.findOne({
      where: {
        id: body.patient_id
      }
    })

    const usmExists = await USMRepository.findOne({
      where: {
        name: body.usm_name
      }
    })

    if(!usmExists){
      return response.status(404).json({
        error: "Invalid USM name"
      })
    }

    if(!patientExists){
      return response.status(404).json({
        error: "Invalid patient id"
      })
    }

    try {
      const vaccine = VaccinesRepository.create(body)
      await VaccinesRepository.save(vaccine)

      return response.status(201).json(vaccine)
    } catch (error: any) {
      return response.status(403).json({
        error: error.message
      })
    }
  }

  async list(request: Request, response: Response){

    const vaccineList = await VaccinesRepository.find()

    return response.json(vaccineList)
  }

  async getOne(request: Request, response: Response){
    const {vaccine_id} = request.params


    const vaccine = await VaccinesRepository.findOne({
      where: {
        id: vaccine_id
      }
    })
    
    if(!vaccine){
      return response.status(404).json({
        error: "Vaccine not found"
      })
    }

    return response.status(302).json(vaccine)
  }

  async alterOne(request: Request, response: Response){
    const body = request.body
    const {vaccine_id} = request.params


    const vaccine = await VaccinesRepository.findOne({
      where: {
        id: vaccine_id
      }
    })
    
    if(!vaccine){
      return response.status(404).json({
        error: "Vaccine not found"
      })
    }
    try {
      await VaccinesRepository.createQueryBuilder()
        .update(Vaccine)
        .set(body)
        .where("id = :id", { id: vaccine_id })
        .execute();
      return response.status(200).json(body)
    } catch (error: any) {
      return response.status(403).json({
        error: error.message
      })
    }
  }

  async deleteOne(request: Request, response: Response){
    const {vaccine_id} = request.params


    const vaccine = await VaccinesRepository.findOne({
      where: {
        id: vaccine_id
      }
    })
    
    if(!vaccine){
      return response.status(404).json({
        error: "Vaccine not found"
      })
    }

    try {
      await VaccinesRepository.createQueryBuilder()
        .delete()
        .from(Vaccine)
        .where("id = :id", { id: vaccine_id })
        .execute();
      return response.status(200).json({
        message: "Vaccine deleted"
      })
    } catch (error: any) {
      return response.status(403).json({
        error: error.message
      })
    }
  }
}

export { VaccineController}