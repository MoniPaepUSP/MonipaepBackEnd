import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { PatientMovementHistory } from "../models";
import { DiseaseOccurrenceRepository, PatientMovementHistoryRepository } from "../repositories";
class PatientMovementHistoryController {
  async create(request: Request, response: Response) {
    const body = request.body

    const diseaseOccurrenceRepository = getCustomRepository(DiseaseOccurrenceRepository)
    const patientMovementRepository = getCustomRepository(PatientMovementHistoryRepository)

    const isValidDiseaseOccurrence = await diseaseOccurrenceRepository.findOne({
      id: body.disease_occurrence_id
    })

    if (!isValidDiseaseOccurrence) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    try {
      const patientMovementHistoryBody = patientMovementRepository.create(body)
      const patientMovementHistory = await patientMovementRepository.save(patientMovementHistoryBody)
  
      return response.status(201).json({
        success: "Histórico de movimentação registrado com sucesso",
        patientMovementHistory
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro do histórico de movimentação"
      })
    }
  }

  async list(request: Request, response: Response) {
    const {disease_occurrence_id, description} = request.query
    const patientMovementRepository = getCustomRepository(PatientMovementHistoryRepository)
    
    if(!disease_occurrence_id && !description) {
      const movementHistory = await patientMovementRepository.find()
      return response.status(200).json(movementHistory)
    } else if (disease_occurrence_id && !description) {
      const diseaseOccurrenceRepository = getCustomRepository(DiseaseOccurrenceRepository)

      const isValidDiseaseOccurrence = await diseaseOccurrenceRepository.findOne({
        id: String(disease_occurrence_id)
      })

      if (!isValidDiseaseOccurrence) {
        return response.status(404).json({
          error: "Disease occurrence is not valid"
        })
      }

      const movementHistoryList = await patientMovementRepository.find({
        disease_occurrence_id: String(disease_occurrence_id)
      })

      return response.status(200).json(movementHistoryList)
    } else if(!disease_occurrence_id && description) {          
      const movementHistoryList = await patientMovementRepository.find({
        description: String(description)
      })

      return response.status(200).json(movementHistoryList)
    } else {
      const diseaseOccurrenceRepository = getCustomRepository(DiseaseOccurrenceRepository)

      const isValidDiseaseOccurrence = await diseaseOccurrenceRepository.findOne({
        id: String(disease_occurrence_id)
      })

      if (!isValidDiseaseOccurrence) {
        return response.status(404).json({
          error: "Disease occurrence is not valid"
        })
      }

      const movementHistoryItem = await patientMovementRepository.findOne({
        disease_occurrence_id: String(disease_occurrence_id),
        description: String(description)
      })

      return response.status(200).json(movementHistoryItem)
    }
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const {disease_occurrence_id, description} = request.params
            
    const patientMovementRepository = getCustomRepository(PatientMovementHistoryRepository)
    const diseaseOccurrenceRepository = getCustomRepository(DiseaseOccurrenceRepository)

    const isValidId = await diseaseOccurrenceRepository.findOne({
      id: disease_occurrence_id
    })

    if(!isValidId) {
      return response.status(404).json({
        error: "Disease occurrence is not valid"
      })
    }

    const isValidDescription = await patientMovementRepository.findOne({
      disease_occurrence_id: disease_occurrence_id,
      description: description
    })

    if(!isValidDescription) {
      return response.status(404).json({
        error: "Movement history not found for this disease occurrence"
      })
    }

    try {
      await patientMovementRepository.createQueryBuilder()
        .update(PatientMovementHistory)
        .set(body)
        .where("disease_occurrence_id = :disease_occurrence_id and description = :description", 
            {disease_occurrence_id: disease_occurrence_id, description: description})
        .execute()
      return response.status(200).json(body)
    } catch (error) {
      return response.status(403).json({
        error: error.message
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const {disease_occurrence_id, description} = request.params
            
    const patientMovementRepository = getCustomRepository(PatientMovementHistoryRepository)
    const diseaseOccurrenceRepository = getCustomRepository(DiseaseOccurrenceRepository)

    const isValidId = await diseaseOccurrenceRepository.findOne({
      id: disease_occurrence_id
    })

    if(!isValidId) {
      return response.status(404).json({
        error: "Disease occurrence is not valid"
      })
    }

    const isValidDescription = await patientMovementRepository.findOne({
      disease_occurrence_id: disease_occurrence_id,
      description: description
    })

    if(!isValidDescription) {
      return response.status(404).json({
        error: "Movement history not found for this disease occurrence"
      })
    }

    try {
      await patientMovementRepository.createQueryBuilder()
        .delete()
        .from(PatientMovementHistory)
        .where("disease_occurrence_id = :disease_occurrence_id and description = :description", 
            {disease_occurrence_id: disease_occurrence_id, description: description})
        .execute()
      return response.status(200).json({
        message: "Movement history for this disease occurrence deleted!"
      })
    } catch (error) {
      return response.status(403).json({
        error: error.message
      })
    }
  }
}

export { PatientMovementHistoryController }