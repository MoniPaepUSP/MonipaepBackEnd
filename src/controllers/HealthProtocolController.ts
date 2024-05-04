import { Request, Response } from "express";
import {  Like, Repository } from "typeorm";
import { HealthProtocol } from "../models";
import { AppDataSource } from "src/database";
// import { HealthProtocolRepository } from "../repositories/HealthProtocolRepository";

class HealthProtocolController {
  private healthProtocolRepository : Repository<HealthProtocol>;

  constructor() {
    this.healthProtocolRepository = AppDataSource.getRepository(HealthProtocol);
  }

  async create(request: Request, response: Response) {
    const body = request.body

    const isAlreadyRegistered = await this.healthProtocolRepository.findOne({
      where: {
        title: body.title
      }
    })

    if (isAlreadyRegistered) {
      return response.status(400).json({
        error: "Protocolo de saúde já registrado"
      })
    }

    try {
      const healthProtocolBody = this.healthProtocolRepository.create(body)
      const healthProtocol = await this.healthProtocolRepository.save(healthProtocolBody)

      return response.status(201).json({
        success: "Protocolo de saúde registrado com sucesso",
        health_protocol: healthProtocol
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro do protocolo de saúde"
      })
    }    
  }

  async list(request: Request, response: Response){
    const { id, page, title, description } = request.query
    let filters = {}
    

    if(id) {
      const isValidHealthProtocol = await this.healthProtocolRepository.findOne({
        where : {
          id: String(id)
        }
      })

      if(!isValidHealthProtocol) {
        return response.status(400).json({
          error: "Protocolo de saúde inválido"
        })
      }

      return response.status(200).json(isValidHealthProtocol)
    }

    if(description) {
      filters = { description: Like(`%${String(description)}%`) }
    } 

    if(title) {
      filters = { title: Like(`%${String(title)}%`) }
    } 

    let options: any = {
      where: filters,
      order: {
        title: 'ASC',
        description: 'ASC'
      },
    }

    if(page) {
      const take = 10
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const healthProtocolList = await this.healthProtocolRepository.findAndCount(options)

    return response.status(200).json({
      healthProtocols: healthProtocolList[0],
      totalHealthProtocols: healthProtocolList[1],
    })
  }

  async alterOne(request: Request, response: Response){
    const body = request.body
    const { id } = request.params


    const isValidHealthProtocol = await this.healthProtocolRepository.findOne({ where: {id} })
    
    if(!isValidHealthProtocol){
      return response.status(404).json({
        error: "Protocolo de saúde não encontrado"
      })
    }

    const isAlreadyRegistered = await this.healthProtocolRepository.findOne({
      where: {
        title: body.title
      }
    })

    if (isAlreadyRegistered) {
      return response.status(400).json({
        error: "Protocolo de saúde já registrado"
      })
    }

    try {
      await this.healthProtocolRepository.createQueryBuilder()
        .update(HealthProtocol)
        .set(body)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Protocolo de saúde alterado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização do protocolo de saúde"
      })
    }
  }

  async deleteOne(request: Request, response: Response){
    const { id } = request.params


    const isValidHealthProtocol = await this.healthProtocolRepository.findOne({ where: {id} })
    
    if(!isValidHealthProtocol){
      return response.status(404).json({
        error: "Protocolo de saúde não encontrado"
      })
    }

    try {
      await this.healthProtocolRepository.createQueryBuilder()
        .delete()
        .from(HealthProtocol)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Protocolo de saúde deletado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção do protocolo de saúde"
      })
    }
  }
}

export { HealthProtocolController };

