import { Request, Response } from "express";
import { IsNull, Like, Repository } from "typeorm";

import { DiseaseOccurrence, Patient, SymptomOccurrence } from "../models";
import {
  DiseaseOccurrenceRepository,
  DiseaseRepository,
  PatientsRepository,
  PatientMovementHistoryRepository,
  SymptomOccurrenceRepository
} from "../repositories";


class DiseaseOccurrenceController {

  // Create a new disease occurrence
  async create(request: Request, response: Response) {
    const body = request.body

    const patientExists = await PatientsRepository.findOne({
      where: {
        id: body.patientId
      }
    })

    if (!patientExists) {
      return response.status(404).json({
        error: "Paciente inválido"
      })
    }

    if (!body.status) {
      body.status = "Suspeito"
    }

    if (!body.dateStart) {
      body.dateStart = new Date()
    }

    let diseases = [], duration = 0;
    for (let id in body.diseaseId) {
      const validDisease = await DiseaseRepository.findOne({
        where: {
          name: id
        }
      })

      if (!validDisease) {
        return response.status(403).json({
          error: `A doença com id '${id}' não se encontra cadastrada no sistema`
        })
      }

      if (body.status == "Suspeito")
        duration = Math.max(duration, validDisease.suspectedMonitoringDays);
      else if (body.status == "Infectado")
        duration = Math.max(duration, validDisease.infectedMonitoringDays);
      diseases.push(validDisease);
    }

    const diseaseOccurrenceBody = DiseaseOccurrenceRepository.create({
      status: body.status,
      dateStart: body.dateStart,
      dateEnd: duration ? new Date(new Date(body.dateStart).getTime() + duration * 24 * 60 * 60 * 1000) : null,
      diagnosis: body.diagnosis,
      patient: patientExists,
      diseases
    })
    const diseaseOccurrence = await DiseaseOccurrenceRepository.save(diseaseOccurrenceBody)

    const notAssignedSymptomOccurrences = await SymptomOccurrenceRepository.find({
      where: {
        patientId: body.patientId,
        diseaseOccurrenceId: IsNull()
      },
    })

    for (const symptomOccurrence of notAssignedSymptomOccurrences) {
      try {
        await SymptomOccurrenceRepository.createQueryBuilder()
          .update(SymptomOccurrence)
          .set({
            diseaseOccurrenceId: diseaseOccurrence.id
          })
          .where("id = :id", { id: symptomOccurrence.id })
          .execute()
      } catch (error) {
        return response.status(403).json({
          error: "Erro na atualização do sintoma"
        })
      }
    }

    return response.status(201).json({
      success: "Ocorrência de doença criada com sucesso",
      diseaseOccurrence
    })
  }

  async list(request: Request, response: Response) {
    const {
      id,
      patientId,
      patientName,
      diseaseName,
      status,
      page
    } = request.query
    const take = 10
    let filters = {}

    if (patientName) {
      const skip = page ? ((Number(page) - 1) * take) : 0
      const limit = page ? take : 99999999
      try {
        const items = await DiseaseOccurrenceRepository.createQueryBuilder("diseaseOccurrence")
          .leftJoinAndSelect("diseaseOccurrence.patient", "patients")
          .where("patients.name like :name", { name: `%${patientName}%` })
          .skip(skip)
          .take(limit)
          .orderBy('diseaseOccurrence.dateStart', 'DESC')
          .addOrderBy('diseaseOccurrence.status', 'ASC')
          .getManyAndCount()
        const formattedData = items[0].map(occurrence => {
          return {
            ...occurrence,
            patient: {
              name: occurrence.patient.name,
              email: occurrence.patient.email
            }
          }
        })
        return response.status(200).json({
          diseaseOccurrences: formattedData,
          totalDiseaseOccurrences: items[1],
        })
      } catch (error) {
        return response.status(404).json({
          error: "Erro na listagem de ocorrências de doenças"
        })
      }
    }

    if (id) {
      filters = { ...filters, id: String(id) }
    }

    if (patientId) {
      filters = { ...filters, patientId: String(patientId) }
    }

    if (diseaseName) {
      filters = { ...filters, diseaseName: Like(`%${String(diseaseName)}%`) }
    }

    if (status) {
      filters = { ...filters, status: Like(`%${String(status)}%`) }
    }

    let options: any = {
      where: filters,
      relations: ["patient"],
      order: {
        dateStart: 'DESC',
        status: 'ASC'
      }
    }

    if (page) {
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const diseaseOccurrences = await DiseaseOccurrenceRepository.findAndCount(options)

    const filteredDiseaseOccurences = diseaseOccurrences[0].map(occurrence => {
      return {
        ...occurrence,
        patient: {
          name: occurrence.patient.name,
          email: occurrence.patient.email
        }
      }
    })

    return response.status(200).json({
      diseaseOccurrences: filteredDiseaseOccurences,
      totalDiseaseOccurrences: diseaseOccurrences[1]
    })
  }

  async listDiseaseDetails(request: Request, response: Response) {
    const { id } = request.params

    const diseaseOccurrenceDetails = await DiseaseOccurrenceRepository.findOne({
      where: { id },
    })

    if (!diseaseOccurrenceDetails) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const movementHistory = await PatientMovementHistoryRepository.find({
      where: { diseaseOccurrenceId: id },
    })

    const symptomOccurrencesList = await SymptomOccurrenceRepository.find({
      where: { diseaseOccurrenceId: id },
      order: {
        registeredDate: 'DESC'
      }
    })

    return response.status(200).json({
      occurrenceDetails: diseaseOccurrenceDetails,
      symptomsList: symptomOccurrencesList,
      movementHistory
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params

    const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({ where: { id } })

    if (!isValidDiseaseOccurrence) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const patientExists = await PatientsRepository.findOne({
      where: {
        id: isValidDiseaseOccurrence.patientId
      }
    })

    if (!patientExists) {
      return response.status(404).json({
        error: "Paciente não encontrado"
      })
    }

    if (body.diseaseId) {
      const diseaseExists = await DiseaseRepository.findOne({
        where: {
          name: body.diseaseId
        }
      })

      if (!diseaseExists) {
        return response.status(404).json({
          error: "Doença não encontrada"
        })
      }
    }

    try {
      await DiseaseOccurrenceRepository.createQueryBuilder()
        .update(DiseaseOccurrence)
        .set(body)
        .where("id = :id", { id })
        .execute()

      return response.status(200).json({
        success: "Ocorrência de doença atualizada"
      })
    } catch (error) {
      return response.status(404).json({
        error: "Erro na atualização da ocorrência de doença"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params

    const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({ where: { id: id } })

    if (!isValidDiseaseOccurrence) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const patientExists = await PatientsRepository.findOne({
      where: {
        id: isValidDiseaseOccurrence.patientId
      }
    })

    if (!patientExists) {
      return response.status(404).json({
        error: "Paciente não encontrado"
      })
    }

    try {
      await DiseaseOccurrenceRepository.createQueryBuilder()
        .delete()
        .from(DiseaseOccurrence)
        .where("id = :id", { id })
        .execute()

      return response.status(200).json({
        success: "Ocorrência de doença deletada"
      })
    } catch (error) {
      return response.status(404).json({
        error: "Erro na deleção da ocorrência de doença"
      })
    }
  }
}

export { DiseaseOccurrenceController }