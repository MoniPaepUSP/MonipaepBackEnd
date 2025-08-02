import { Request, Response } from "express";
// import { getCustomRepository } from "typeorm";
import {  PatientMovementHistory } from "../models";

import { DiseaseOccurrenceRepository, PatientMovementHistoryRepository } from "../repositories";
class PatientMovementHistoryController {


  async create(request: Request, response: Response) {
    const body = request.body

    const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({
      where: {
        id: body.disease_occurrence_id
      }
    })

    if (!isValidDiseaseOccurrence) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    try {
      const patientMovementHistoryBody = PatientMovementHistoryRepository.create(body)
      const patientMovementHistory = await PatientMovementHistoryRepository.save(patientMovementHistoryBody)
  
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
    const { disease_occurrence_id, id } = request.query

    let filters = {}

    if(id) {
      filters = { ...filters, id: String(id) }

      const isValidPatientMovementHistory = await PatientMovementHistoryRepository.findOne({
        where: {
          id: String(id)
        }
      })

      if (!isValidPatientMovementHistory) {
        return response.status(404).json({
          error: "Histórico de movimentação não encontrado"
        })
      }
    }

    if(disease_occurrence_id) {
      filters = { ...filters, disease_occurrence_id: String(disease_occurrence_id) }

      const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({
        where: {
          id: String(disease_occurrence_id)
        }
      })
  
      if (!isValidDiseaseOccurrence) {
        return response.status(404).json({
          error: "Ocorrência de doença não encontrada"
        })
      }
    }
    const movementHistoryItems = await PatientMovementHistoryRepository.find(filters)

    return response.status(200).json(movementHistoryItems)
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params
            

    const isValidMovement = await PatientMovementHistoryRepository.findOne({ where: {id : id} })

    if(!isValidMovement) {
      return response.status(404).json({
        error: "Histórico de movimentação não encontrado"
      })
    }

    try {
      await PatientMovementHistoryRepository.createQueryBuilder()
        .update(PatientMovementHistory)
        .set(body)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Histórico de movimentação alterado com sucesso",
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização do histórico de movimentação"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params
            

    const isValidMovement = await PatientMovementHistoryRepository.findOne({ where: {id :id} })

    if(!isValidMovement) {
      return response.status(404).json({
        error: "Histórico de movimentação não encontrado"
      })
    }

    try {
      await PatientMovementHistoryRepository.createQueryBuilder()
        .delete()
        .from(PatientMovementHistory)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Histórico de movimentação deletado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção do histórico de movimentação"
      })
    }
  }
}

export { PatientMovementHistoryController }