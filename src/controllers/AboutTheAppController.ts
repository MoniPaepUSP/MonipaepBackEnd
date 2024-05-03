import { Request, Response } from "express";
import {  Like, Repository } from 'typeorm'
import { AboutTheApp } from "../models";
// import { AboutTheAppsRepository } from "../repositories";

import { AppDataSource } from "src/database";

class AboutTheAppController{
  private AboutTheAppRepository : Repository<AboutTheApp>;
  
  constructor() { // cria o repositorio que sera compartilhado por todo controller
    this.AboutTheAppRepository = AppDataSource.getRepository(AboutTheApp);
  }

  async create(request: Request, response: Response){
    const body = request.body
    
    // const AboutTheAppRepository = getCustomRepository(AboutTheAppsRepository)
    

    const AboutTheAppAlreadyExists = await this.AboutTheAppRepository.findOne({
      where : {
        main: body.main
      }
    })

    if(AboutTheAppAlreadyExists){
      return response.status(403).json({
        error: "Essa informação já foi registrada"
      })
    }

    try {
      const AboutTheAppBody = this.AboutTheAppRepository.create(body)
      const about: any = await this.AboutTheAppRepository.save(AboutTheAppBody)
  
      return response.status(201).json({
        success: "Informação registrada com sucesso",
        about
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro da informação"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { main, id } = request.query

    let filters = {}

    if(id) {
      const mainExists = await this.AboutTheAppRepository.findOne({
        where: {id: String(id)}
      })

      if(!mainExists) {
        return response.status(404).json({
          error: "Informação não encontrada"
        })
      }

      filters = { ...filters, id: String(id) }
    }

    if(main) {
      filters = { ...filters, main: Like(`%${String(main)}%`) }
    }

    const mainsList = await this.AboutTheAppRepository.findAndCount({
      where: filters,
      order: {
        main: "ASC"
      }
    })
  
    return response.status(200).json({
      AboutTheApps: mainsList[0],
      totalAboutTheApps: mainsList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params


    const mainExists = await this.AboutTheAppRepository.findOne({where: { id : id} })

    if(!mainExists) {
      return response.status(404).json({
        error: "Informação não encontrada"
      })
    }

    try {
      await this.AboutTheAppRepository.createQueryBuilder()
        .update(AboutTheApp)
        .set(body)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Informação atualizada com sucesso",
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na alteração da Informação"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params


    const questionExists = await this.AboutTheAppRepository.findOne({ where: {id : id} })

    if(!questionExists) {
      return response.status(404).json({
        error: "Informação não encontrada"
      })
    }
    
    try {
      await this.AboutTheAppRepository.createQueryBuilder()
        .delete()
        .from(AboutTheApp)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Informação deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da Informação"
      })
    }
  }
}

export { AboutTheAppController };