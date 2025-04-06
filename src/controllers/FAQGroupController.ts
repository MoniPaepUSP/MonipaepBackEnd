import { Request, Response } from "express";
import { Like } from 'typeorm'
import { FAQGroup } from "../models";

import { FAQGroupRepository } from "src/repositories";

class FAQGroupController {

  async create(request: Request, response: Response) {
    const { name } = request.body;

    const faqAlreadyExists = await FAQGroupRepository.findOne({
      where: {
        name
      }
    })

    if (faqAlreadyExists) {
      return response.status(403).json({
        error: "Esse nome de grupo já foi registrado"
      })
    }

    try {
      const faqGroupBody = FAQGroupRepository.create({ name });
      const faqGroup: any = await FAQGroupRepository.save(faqGroupBody)

      return response.status(201).json({
        success: "Questão registrada com sucesso",
        faqGroup
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro da questão"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name, id } = request.query

    let filters = {};

    if (id) {
      const groupExists = await FAQGroupRepository.findOne({
        where: { id: String(id) }
      })

      if (!groupExists) {
        return response.status(404).json({
          error: "Questão não encontrada"
        })
      }

      filters = { ...filters, id: String(id) }
    }

    if (name) {
      filters = { ...filters, name: Like(`%${String(name)}%`) }
    }

    const groupList = await FAQGroupRepository.findAndCount({
      where: filters,
      order: {
        name: "ASC"
      },
      relations: ["faqs"],
    })

    return response.status(200).json({
      groups: groupList[0],
      totalGroups: groupList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params

    const groupExists = await FAQGroupRepository.findOne({ where: { id } })

    if (!groupExists) {
      return response.status(404).json({
        error: "Questão não encontrada"
      })
    }

    try {
      await FAQGroupRepository.createQueryBuilder()
        .update(FAQGroup)
        .set(body)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Questão atualizada com sucesso",
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na alteração da questão"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params

    const questionExists = await FAQGroupRepository.findOne({ where: { id } })

    if (!questionExists) {
      return response.status(404).json({
        error: "Questão não encontrada"
      })
    }

    try {
      await FAQGroupRepository.createQueryBuilder()
        .delete()
        .from(FAQGroup)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Questão deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da questão"
      })
    }
  }
}

export { FAQGroupController };