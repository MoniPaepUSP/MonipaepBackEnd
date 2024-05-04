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
  

  async create(request: Request, response: Response) {
    const body = request.body

    console.log(body)


    const patientExists = await PatientsRepository.findOne({
      where: {
        id: body.patient_id
      }
    })

    if(!patientExists) {
      return response.status(404).json({
        error: "Paciente inválido"
      })
    }

    if(patientExists.status === "Óbito") {
      return response.status(404).json({
        error: "Não é possível registrar um caso de doença para um paciente com o status 'Óbito'"
      })
    }

    if(!body.status) {
      body.status = "Suspeito"
    }

    if(!body.date_start) {
      body.date_start = new Date()
    }

    let createdDiseaseOccurrences = []

    for (let i in body.disease_name) {
      const validDisease = await DiseaseRepository.findOne({
        where: {
          name: body.disease_name[i]
        }
      })

      if(!validDisease) {
        return response.status(403).json({
          error: `A doença '${body.disease_name[i]}' não se encontra cadastrada no sistema`
        })
      }

      const diseaseOccurrenceBody = DiseaseOccurrenceRepository.create({
        ...body,
        disease_name: body.disease_name[i]
      })

      const diseaseOccurrence = await DiseaseOccurrenceRepository.save(diseaseOccurrenceBody)
      createdDiseaseOccurrences.push(diseaseOccurrence)
    }

    const numberOfDiseaseOccurrences = createdDiseaseOccurrences.length

    const notAssignedSymptomOccurrences = await SymptomOccurrenceRepository.find({
      where: {
        patient_id: body.patient_id,
        disease_occurrence_id: IsNull()
      }
    })

    for(const symptomOccurrence of notAssignedSymptomOccurrences) {
      try {
        await SymptomOccurrenceRepository.createQueryBuilder()
        .update(SymptomOccurrence)
          .set({
            disease_occurrence_id: createdDiseaseOccurrences[0].id
          })
          .where("id = :id", { id: symptomOccurrence.id })
          .execute()
      } catch (error) {
        return response.status(403).json({
          error: "Erro na atualização do sintoma"
        })
      }
    }
      
    if(numberOfDiseaseOccurrences > 1) {
      for(let i = 1; i < numberOfDiseaseOccurrences; i++) {
        for(const symptomOccurrence of notAssignedSymptomOccurrences) {
          try {
            const symptomOccurrenceBody = SymptomOccurrenceRepository.create({
              patient_id: symptomOccurrence.patient_id,
              symptom_name: symptomOccurrence.symptom_name,
              registered_date: symptomOccurrence.registered_date,
              disease_occurrence_id: createdDiseaseOccurrences[i].id
            })
            await SymptomOccurrenceRepository.save(symptomOccurrenceBody)
          } catch (error) {
            return response.status(403).json({
              error: "Erro na atualização do sintoma."
            })
          }
        }
      }
    } 

    const diseaseOccurrences = await DiseaseOccurrenceRepository.find({
      where: {
        patient_id: patientExists.id
      }
    })
    
    let finalStatus = diseaseOccurrences[0].status
    if(finalStatus !== "Óbito") {
      for(let occurrence of diseaseOccurrences) {
        if(occurrence.status === "Óbito") {
          finalStatus = "Óbito"
          break
        }
        else if(occurrence.status === "Infectado") {
          finalStatus = "Infectado"
        }
        else if(occurrence.status === "Suspeito" && finalStatus !== "Infectado") {
          finalStatus = "Suspeito"
        }
        else if(
          (occurrence.status === "Saudável" || occurrence.status === "Curado") 
          && finalStatus !== "Infectado" && finalStatus !== "Suspeito"
        ) {
          finalStatus = "Saudável"
        }
      }
    }

    try {
      await PatientsRepository.createQueryBuilder()
        .update(Patient)
        .set({ status: finalStatus })
        .where("id = :id", { id: patientExists.id })
        .execute()
    } catch (error) {
      return response.status(404).json({
        error: "Erro na atualização do status do paciente"
      })
    }
    
    return response.status(201).json({
      success: "Ocorrência de doença criada com sucesso",
      createdDiseaseOccurrences
    })
  }

  async list (request: Request, response: Response) {
    const {
      id,
      patient_id,
      patient_name,
      disease_name,
      status,
      page
    } = request.query
    const take = 10
    let filters = {}


    if(patient_name) {
      const skip = page ? ((Number(page) - 1) * take) : 0 
      const limit = page ? take : 99999999
      try {
        const items = await DiseaseOccurrenceRepository.createQueryBuilder("disease_occurrence")
          .leftJoinAndSelect("disease_occurrence.patient", "patients")
          .where("patients.name like :name", { name: `%${patient_name}%` })
          .skip(skip)
          .take(limit)
          .orderBy('disease_occurrence.date_start', 'DESC')
          .addOrderBy('disease_occurrence.status', 'ASC')
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

    if(id) {
      filters = { ...filters, id: String(id) }
    }

    if(patient_id) {
      filters = { ...filters, patient_id: String(patient_id) }
    }

    if(disease_name) {
      filters = { ...filters, disease_name: Like(`%${String(disease_name)}%`)  }
    }

    if(status) {
      filters = { ...filters, status: Like(`%${String(status)}%`) }
    }

    let options: any = {
      where: filters,
      relations: ["patient"],
      order: {
        date_start: 'DESC',
        status: 'ASC'
      }
    }

    if(page) {
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

    if(!diseaseOccurrenceDetails) {
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const movementHistory = await PatientMovementHistoryRepository.find({
      where: { disease_occurrence_id: id },
    })

    const symptomOccurrencesList = await SymptomOccurrenceRepository.find({
      where: { disease_occurrence_id: id },
      order: {
        registered_date: 'DESC'
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

    
    const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({ where: {id} })

    if(!isValidDiseaseOccurrence){
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const patient = await PatientsRepository.findOne({
      where: {
        id: isValidDiseaseOccurrence.patient_id 
      }
    })

    if(body.disease_name) {
      const diseaseName = await DiseaseRepository.findOne({
        where : {
          name: body.disease_name
        }
      })
  
      if(!diseaseName){
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
      if(body.status && (body.status !== patient.status)) {
        const diseaseOccurrences = await DiseaseOccurrenceRepository.find({
          where: {
            patient_id: patient.id
          }
        })
        let finalStatus = diseaseOccurrences[0].status
        if(finalStatus !== "Óbito") {
          for(let occurrence of diseaseOccurrences) {
            if(occurrence.status === "Óbito") {
              finalStatus = "Óbito"
              break
            }
            else if(occurrence.status === "Infectado") {
              finalStatus = "Infectado"
            }
            else if(occurrence.status === "Suspeito" && finalStatus !== "Infectado") {
              finalStatus = "Suspeito"
            }
            else if(
              (occurrence.status === "Saudável" || occurrence.status === "Curado") 
              && finalStatus !== "Infectado" && finalStatus !== "Suspeito"
            ) {
              finalStatus = "Saudável"
            }
          }
        }
        try {
          await PatientsRepository.createQueryBuilder()
            .update(Patient)
            .set({ status: finalStatus })
            .where("id = :id", { id: patient.id })
            .execute()
        } catch (error) {
          return response.status(404).json({
            error: "Erro na atualização do status do paciente"
          })
        }
      }
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
    

    const isValidDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({ where: {id : id} })

    if(!isValidDiseaseOccurrence){
      return response.status(404).json({
        error: "Ocorrência de doença não encontrada"
      })
    }

    const patient = await PatientsRepository.findOne({
      where: {
        id: isValidDiseaseOccurrence.patient_id
      }
    })

    try {
      await DiseaseOccurrenceRepository.createQueryBuilder()
        .delete()
        .from(DiseaseOccurrence)
        .where("id = :id", { id })
        .execute()
      const diseaseOccurrences = await DiseaseOccurrenceRepository.find({
        where: {
          patient_id: patient.id
        }
      })
      
      let finalStatus = diseaseOccurrences[0]?.status ?? "Saudável"
      if(finalStatus !== "Óbito" || diseaseOccurrences.length === 0) {
        for(let occurrence of diseaseOccurrences) {
          if(occurrence.status === "Óbito") {
            finalStatus = "Óbito"
            break
          }
          else if(occurrence.status === "Infectado") {
            finalStatus = "Infectado"
          }
          else if(occurrence.status === "Suspeito" && finalStatus !== "Infectado") {
            finalStatus = "Suspeito"
          }
          else if(
            (occurrence.status === "Saudável" || occurrence.status === "Curado") 
            && finalStatus !== "Infectado" && finalStatus !== "Suspeito"
          ) {
            finalStatus = "Saudável"
          }
        }
      }
  
      try {
        await PatientsRepository.createQueryBuilder()
          .update(Patient)
          .set({ status: finalStatus })
          .where("id = :id", { id: patient.id })
          .execute()
      } catch (error) {
        return response.status(404).json({
          error: "Erro na atualização do status do paciente"
        })
      }

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