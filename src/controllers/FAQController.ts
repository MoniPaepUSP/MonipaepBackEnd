import { Request, Response } from "express";
import { Like } from 'typeorm'
import { FAQ } from "../models";
import { FAQGroupRepository, FAQRepository } from "../repositories";

class FAQController {

  async create(request: Request, response: Response) {
    const { question, answer, faqGroupId } = request.body;

    const faqAlreadyExists = await FAQRepository.findOne({
      where: {
        question
      }
    })

    if (faqAlreadyExists) {
      return response.status(403).json({
        error: "Essa questão já foi registrada"
      })
    }

    const faqGroupExists = await FAQGroupRepository.findOne({
      where: {
        id: faqGroupId
      }
    })

    if (!faqGroupExists) {
      return response.status(403).json({
        error: "O grupo ao qual se quer relacionar a pergunta não existe"
      })
    }

    try {
      const faqBody = FAQRepository.create({
        question, answer, faqGroupId
      })
      const faq: any = await FAQRepository.save(faqBody)

      return response.status(201).json({
        success: "Questão registrada com sucesso",
        faq
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro da questão"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name } = request.query

    let filters = {};

    if (name) {
      filters = { ...filters, name: Like(`%${String(name)}%`) }
    }

    const questionList = await FAQRepository.findAndCount({
      where: filters,
      order: {
        question: "ASC"
      },
    })

    return response.status(200).json({
      questions: questionList[0],
      totalQuestions: questionList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params

    const questionExists = await FAQRepository.findOne({ where: { id } })

    if (!questionExists) {
      return response.status(404).json({
        error: "Questão não encontrada"
      })
    }

    try {
      await FAQRepository.createQueryBuilder()
        .update(FAQ)
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

    const questionExists = await FAQRepository.findOne({ where: { id } })

    if (!questionExists) {
      return response.status(404).json({
        error: "Questão não encontrada"
      })
    }

    try {
      await FAQRepository.createQueryBuilder()
        .delete()
        .from(FAQ)
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

export { FAQController };