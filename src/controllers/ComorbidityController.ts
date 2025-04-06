import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { ComorbidityRepository } from '../repositories';

class ComorbidityController {

  async create(request: Request, response: Response) {
    const body = request.body

    const comorbidityAlreadyExists = await ComorbidityRepository.findOne({
      where: {
        name: body.name
      }
    })

    if (comorbidityAlreadyExists) {
      return response.status(403).json({
        error: "Comorbidade já registrada"
      })
    }

    try {
      const comorbidity = ComorbidityRepository.create(body)
      await ComorbidityRepository.save(comorbidity)

      return response.status(201).json({
        success: "Comorbidade registrada com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro no registro da comorbidade"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query
    let filters = {}

    if (name) {
      filters = { name: Like(`%${String(name)}%`) }
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

    const comorbidityList = await ComorbidityRepository.findAndCount(options)

    return response.status(200).json({ comorbidityList: comorbidityList[0] });
  }

  async alterOne(request: Request, response: Response) {
    const { name } = request.params
    const body = request.body

    const comorbidity = await ComorbidityRepository.findOne({
      where: {
        name
      }
    })

    if (!comorbidity) {
      return response.status(404).json({
        error: "Comorbidade não encontrada"
      })
    }

    try {
      await ComorbidityRepository.update(comorbidity.name, body)

      return response.status(200).json({
        success: "Comorbidade atualizada com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro na atualização da comorbidade"
      })
    }
  }

  async delete(request: Request, response: Response) {
    const { name } = request.params

    const comorbidity = await ComorbidityRepository.findOne({
      where: {
        name
      }
    })

    if (!comorbidity) {
      return response.status(404).json({
        error: "Comorbidade não encontrada"
      })
    }

    try {
      await ComorbidityRepository.delete(comorbidity.name)

      return response.status(200).json({
        success: "Comorbidade deletada com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro na deleção da comorbidade"
      })
    }
  }
}

export { ComorbidityController }