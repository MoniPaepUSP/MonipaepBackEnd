import { Request, Response } from "express";
import { Like } from "typeorm";
import { Symptom } from "../models";
import { SymptomRepository } from "../repositories";

class SymptomController {

  async create(request: Request, response: Response) {
    const body = request.body

    const symptomAlreadyExists = await SymptomRepository.findOne({
      where: {
        name: body.name
      }
    })

    if (symptomAlreadyExists) {
      return response.status(403).json({
        error: "Sintoma já registrado"
      })
    }

    try {
      const symptom = SymptomRepository.create(body)
      await SymptomRepository.save(symptom)

      return response.status(201).json({
        success: "Sintoma registrado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na criação do sintoma"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query
    let filters = {}


    if (name) {
      filters = { symptom: Like(`%${String(name)}%`) }
    }

    let options: any = {
      where: filters,
      order: {
        name: 'ASC'
      },
    }

    if (page) {
      const take = 10
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const symptomsList = await SymptomRepository.findAndCount(options)

    return response.status(200).json({ symptomsList: symptomsList[0] })
  }

  async alterOne(request: Request, response: Response) {
    const { name, description } = request.body
    const { id } = request.params

    const isValidSymptom = await SymptomRepository.findOne({ where: { id } })

    if (!isValidSymptom) {
      return response.status(404).json({
        error: "Sintoma não encontrado"
      })
    }

    try {
      await SymptomRepository.createQueryBuilder()
        .update(Symptom)
        .set({ name, description })
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Sintoma atualizado com sucesso",
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização do sintoma"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params

    const isValidSymptom = await SymptomRepository.findOne({ where: { id } })

    if (!isValidSymptom) {
      return response.status(404).json({
        error: "Sintoma não encontrado"
      })
    }

    try {
      await SymptomRepository.createQueryBuilder()
        .delete()
        .from(Symptom)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Sintoma deletado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção do sintoma"
      })
    }
  }
}

export { SymptomController }