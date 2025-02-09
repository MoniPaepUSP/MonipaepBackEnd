import { Request, Response } from 'express'
// import { Repository, getCustomRepository } from "typeorm"
import { FAQSuggestions } from '../models'
import logger from '../common/loggerConfig';
import { FAQSuggestionsRepository } from '../repositories'

class FAQSuggestionsController {


  async create(request: Request, response: Response) {
    const body = request.body
    

    const faqSuggestedExists = await FAQSuggestionsRepository.findOne ({
      where: {
        question: body.question
      }
    })

    if(faqSuggestedExists) {
      return response.status (403).json ({
        error: 'Essa sugestão de questão já foi registrada'
      })
    }

    try {
      const faqBody = FAQSuggestionsRepository.create (body)
      const faq: FAQSuggestions[] = await FAQSuggestionsRepository.save (faqBody)
  
      return response.status (201).json ({
        success: 'Sugestão de questão registrada com sucesso',
        faq
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro no registro da sugestão de questão'
      })
    }
  }
  
  async list(request: Request, response: Response) {
    const { question, id } = request.query

    let filters = {}

    if(id) {
      filters = { ...filters, id: String (id) }

      const questionExists = await FAQSuggestionsRepository.findOne ({
        where : {
          id: String (id)
        }
      })

      if(!questionExists) {
        return response.status (404).json ({
          error: 'Sugestão de questão não encontrada'
        })
      }
    }

    if(question) {
      filters = { ...filters, question: String (question) }

      const questionExists = await FAQSuggestionsRepository.findOne ({
        where: {
          question: String (question)
        }
      })

      if(!questionExists) {
        return response.status (404).json ({
          error: 'Sugestão de questão não encontrada'
        })
      }
    }
    const questionsList = await FAQSuggestionsRepository.find (filters)

    return response.status (200).json (questionsList)
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params


    const questionExists = await FAQSuggestionsRepository.findOne ({ where: { id } })

    if(!questionExists) {
      return response.status (404).json ({
        error: 'Sugestão de questão não encontrada'
      })
    }
    
    try {
      await FAQSuggestionsRepository.createQueryBuilder ()
        .delete ()
        .from (FAQSuggestions)
        .where ('id = :id', { id })
        .execute ()
      return response.status (200).json ({
        message: 'Sugestão de questão deletada com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na deleção da sugestão de questão'
      })
    }
  }
}

export { FAQSuggestionsController }