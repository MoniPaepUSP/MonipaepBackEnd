import { Request, Response } from "express";
import {  Like } from "typeorm";
import { AssignedHealthProtocol, } from "../models";


import { AssignedHealthProtocolRepository, DiseaseRepository, HealthProtocolRepository } from "src/repositories";

class AssignedHealthProtocolController {
 
  async create(request: Request, response: Response) {
    const body = request.body    

    const isValidDisease = await DiseaseRepository.findOne({
      where : {
        name: body.disease_name
      }
    })

    if(!isValidDisease) {
      return response.status(400).json({
        error: "Doença não encontrada"
      })
    }

    const isValidHealthProtocol = await HealthProtocolRepository.findOne({
      where : {
        id: body.healthprotocol_id
      }
    })
    
    if(!isValidHealthProtocol) {
      return response.status(400).json({
        error: "Protocolo de saúde não encontrado"
      })
    }

    const isAlreadyAssigned = await AssignedHealthProtocolRepository.findOne({
     where: { 
        diseaseName: body.disease_name,
        healthProtocolId: body.healthprotocol_id
      }
    })

    if(isAlreadyAssigned) {
      return response.status(403).json({
        error: "Este protocolo de saúde já está atribuído à essa doença"
      })
    }

    try {
      const assignedHealthProtocolBody = AssignedHealthProtocolRepository.create(body)
      const assignedHealthProtocol = await AssignedHealthProtocolRepository.save(assignedHealthProtocolBody)
  
      return response.status(201).json({
        success: "Protocolo de saúde atribuído à essa doença com sucesso",
        assigned_health_protocol: assignedHealthProtocol
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atribuição do protocolo de saúde à essa doença"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { 
      disease_name, 
      healthprotocol_id, 
      healthprotocol_title,
      page 
    } = request.query
    const take = 10
    let filters = {}



    if(disease_name) {
      filters = { ...filters, disease_name: Like(`%${String(disease_name)}%`) }
    }

    if(healthprotocol_id) {
      filters = { ...filters, healthprotocol_id: String(healthprotocol_id) }
    }

    if(healthprotocol_title) {
      const skip = page ? ((Number(page) - 1) * take) : 0 
      const limit = page ? take : 99999999
      try {
        const items = await AssignedHealthProtocolRepository.createQueryBuilder("assigned_healthprotocol")
          .leftJoinAndSelect("assigned_healthprotocol.healthprotocol", "healthProtocols")
          .where("healthProtocols.title like :title", { title: `%${healthprotocol_title}%` })
          .skip(skip)
          .take(limit)
          .getManyAndCount()
        return response.status(200).json({
          assignedHealthProtocols: items[0],
          totalAssignedHealthProtocols: items[1],
        })
      } catch (error) {
        return response.status(403).json({
          error: "Erro na listagem das associações"
        })
      }
    }

    let options: any = {
      where: filters,
      relations: ["healthprotocol"]
    }

    if(page) {
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const associationList = await AssignedHealthProtocolRepository.findAndCount(options)

    return response.status(200).json({
      assignedHealthProtocols: associationList[0],
      totalAssignedHealthProtocols: associationList[1],
    })
  }

  async deleteOne(request: Request, response: Response) {
    const { disease_name, healthprotocol_id } = request.params
    
   
    const diseaseExists = await DiseaseRepository.findOne({
      where : {
        name: String(disease_name)
      }
    })

    if(!diseaseExists) {
      return response.status(404).json({
        error: "Doença não encontrada"
      })
    }

    const healthProtocolExists = await HealthProtocolRepository.findOne({
      where :{ 
        id: String(healthprotocol_id)
      }
    })
    
    if(!healthProtocolExists) {
      return response.status(404).json({
        error: "Protocolo de saúde não encontrado"
      })
    }

    const associationExists = await AssignedHealthProtocolRepository.findOne({
      where: {
        healthProtocolId: String(healthprotocol_id),
        diseaseName: String(healthprotocol_id)
      }
    })

    if(!associationExists) {
      return response.status(404).json({
        error: "Protocolo de saúde não associado à essa doença"
      })
    }

    try {
      await AssignedHealthProtocolRepository.createQueryBuilder()
        .delete()
        .from(AssignedHealthProtocol)
        .where("healthprotocol_id = :healthprotocol_id and disease_name = :disease_name", {
          healthprotocol_id, 
          disease_name
        })
        .execute()
      return response.status(200).json({
        success: "Associação deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da associação"
      })
    }
  }
}

export { AssignedHealthProtocolController }