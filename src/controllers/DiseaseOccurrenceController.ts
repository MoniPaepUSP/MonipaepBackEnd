import { Request, Response } from "express";
import { IsNull, Like, Repository } from "typeorm";

import { Disease, DiseaseOccurrence, Patient, SymptomOccurrence } from "../models";
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
      body.dateStart = new Date(body.dateStart)
    }

    let diseases = [];
    for (let id of body.diseaseIds) {
      const validDisease = await DiseaseRepository.findOne({
        where: {
          id
        }
      })

      if (!validDisease) {
        return response.status(403).json({
          error: `A doença com id '${id}' não se encontra cadastrada no sistema`
        })
      }

      diseases.push(validDisease);
    }

    const diseaseOccurrenceBody = DiseaseOccurrenceRepository.create({
      status: body.status,
      dateStart: body.dateStart,
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
          .leftJoinAndSelect("diseaseOccurrence.patient", "patient")
          .where("patient.name like :name", { name: `%${patientName}%` })
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

    if (status) {
      filters = { ...filters, status: Like(`%${String(status)}%`) }
    }

    let options: any = {
      where: filters,
      relations: ["patient", "diseases"],
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

    const diseaseOccurrence = await DiseaseOccurrenceRepository.findOne({
      where: { id },
      relations: ['diseases']
    })

    if (!diseaseOccurrence) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    // const movementHistory = await PatientMovementHistoryRepository.find({
    //   where: { diseaseOccurrenceId: id },
    // })

    const symptomOccurrences = await SymptomOccurrenceRepository.find({
      where: { diseaseOccurrenceId: id },
      order: {
        registeredDate: 'DESC'
      },
      relations: ['symptoms']
    })

    return response.status(200).json({
      diseaseOccurrence,
      symptomOccurrences,
      // movementHistory
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body;
    const { id } = request.params;

    const occurrence = await DiseaseOccurrenceRepository.findOne({
      where: { id },
      relations: ["diseases"] // preciso carregar relações para poder manipular/limpar
    });

    if (!occurrence) return response.status(404).json({ error: "Ocorrência de doença não encontrada" });

    // valida paciente (se necessário)
    const patientExists = await PatientsRepository.findOne({ where: { id: occurrence.patientId } });
    if (!patientExists) return response.status(404).json({ error: "Paciente não encontrado" });

    // montar array de entidades Disease
    const diseases: Disease[] = [];
    if (body.diseaseIds) {
      for (const diseaseId of body.diseaseIds) {
        const disease = await DiseaseRepository.findOne({ where: { id: diseaseId } });
        if (!disease) return response.status(404).json({ error: `Doença ${diseaseId} não encontrada` });
        diseases.push(disease);
      }
    }

    // atualizar campos da ocorrência
    occurrence.status = body.status ?? occurrence.status;
    occurrence.dateStart = body.dateStart ?? occurrence.dateStart;
    occurrence.dateEnd = body.dateEnd;
    occurrence.diagnosis = body.diagnosis ?? occurrence.diagnosis;

    // substituir relações (ou não, depende do comportamento desejado)
    if (body.diseaseIds) occurrence.diseases = diseases;

    try {
      await DiseaseOccurrenceRepository.save(occurrence);
      return response.status(200).json({ success: "Ocorrência de doença atualizada" });
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: "Erro na atualização da ocorrência de doença" });
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