import { Request, Response } from 'express';
import { RiskGroupRepository } from 'src/repositories';
import { Like } from 'typeorm';

class RiskGroupController {
  async create(request: Request, response: Response) {
    const body = request.body

    const riskGroupAlreadyExists = await RiskGroupRepository.findOne({
      where: {
        name: body.name
      }
    })

    if (riskGroupAlreadyExists) {
      return response.status(403).json({
        error: "Grupo de risco já registrado"
      })
    }

    try {
      const riskGroup = RiskGroupRepository.create(body)
      await RiskGroupRepository.save(riskGroup)

      return response.status(201).json({
        success: "Grupo de risco registrado com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro no registro do grupo de risco"
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

    const riskGroupList = await RiskGroupRepository.findAndCount(options)

    return response.status(200).json({
      riskGroups: riskGroupList[0],
      total: riskGroupList[1]
    })
  }

  async update(request: Request, response: Response) {
    const { id } = request.params
    const body = request.body

    try {
      await RiskGroupRepository.update(id, body)

      return response.status(200).json({
        success: "Grupo de risco atualizado com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro na atualização do grupo de risco"
      })
    }
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params

    try {
      await RiskGroupRepository.delete(id)

      return response.status(200).json({
        success: "Grupo de risco deletado com sucesso"
      })
    } catch (error) {
      return response.status(400).json({
        error: "Erro na deleção do grupo de risco"
      })
    }
  }
}

export { RiskGroupController }

