import { Request, Response } from "express"
// import { Repository, getCustomRepository } from "typeorm"
import { FAQSuggestion } from "../models"
import { FAQSuggestionRepository } from "../repositories"

class FAQSuggestionsController {


  async create(request: Request, response: Response) {
    const body = request.body


    const faqSuggestedExists = await FAQSuggestionRepository.findOne({
      where: {
        question: body.question
      }
    })

    if (faqSuggestedExists) {
      return response.status(403).json({
        error: "Essa sugestão de questão já foi registrada"
      })
    }

    try {
      const faqBody = FAQSuggestionRepository.create(body)
      const faq: any = await FAQSuggestionRepository.save(faqBody)

      return response.status(201).json({
        success: "Sugestão de questão registrada com sucesso",
        faq
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no registro da sugestão de questão"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { question, id } = request.query

    let filters = {}

    if (id) {
      filters = { ...filters, id: String(id) }

      const questionExists = await FAQSuggestionRepository.findOne({
        where: {
          id: String(id)
        }
      })

      if (!questionExists) {
        return response.status(404).json({
          error: "Sugestão de questão não encontrada"
        })
      }
    }

    if (question) {
      filters = { ...filters, question: String(question) }

      const questionExists = await FAQSuggestionRepository.findOne({
        where: {
          question: String(question)
        }
      })

      if (!questionExists) {
        return response.status(404).json({
          error: "Sugestão de questão não encontrada"
        })
      }
    }
    const questionsList = await FAQSuggestionRepository.find(filters)

    return response.status(200).json(questionsList)
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params


    const questionExists = await FAQSuggestionRepository.findOne({ where: { id } })

    if (!questionExists) {
      return response.status(404).json({
        error: "Sugestão de questão não encontrada"
      })
    }

    try {
      await FAQSuggestionRepository.createQueryBuilder()
        .delete()
        .from(FAQSuggestion)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        message: "Sugestão de questão deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da sugestão de questão"
      })
    }
  }
}

export { FAQSuggestionsController }