import { Request, Response } from 'express';
import { Like, Repository } from 'typeorm'
import { FAQ } from '../models';

import { FAQRepository } from '../repositories/FAQRepository';

class FAQController {
 

  async create(request: Request, response: Response) {
    const body = request.body
    

    const faqAlreadyExists = await FAQRepository.findOne ({
      where : {
        question: body.question
      }
    })

    if(faqAlreadyExists) {
      return response.status (403).json ({
        error: 'Essa questão já foi registrada'
      })
    }

    try {
      const faqBody = FAQRepository.create (body)
      const faq: any = await FAQRepository.save (faqBody)
  
      return response.status (201).json ({
        success: 'Questão registrada com sucesso',
        faq
      })
    } catch (error) {
      return response.status (403).json ({
        error: 'Erro no registro da questão'
      })
    }
  }

  async list(request: Request, response: Response) {
    const { question, id } = request.query

    let filters = {}

    if(id) {
      const questionExists = await FAQRepository.findOne ({
        where: {
          id: String (id)
        }
      })

      if(!questionExists) {
        return response.status (404).json ({
          error: 'Questão não encontrada'
        })
      }

      filters = { ...filters, id: String (id) }
    }

    if(question) {
      filters = { ...filters, question: Like (`%${String (question)}%`) }
    }

    const questionsList = await FAQRepository.findAndCount ({
      where: filters,
      order: {
        question: 'ASC'
      }
    })
  
    return response.status (200).json ({
      faqs: questionsList[0],
      totalFaqs: questionsList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params


    const questionExists = await FAQRepository.findOne ({ where: { id } })

    if(!questionExists) {
      return response.status (404).json ({
        error: 'Questão não encontrada'
      })
    }

    try {
      await FAQRepository.createQueryBuilder ()
        .update (FAQ)
        .set (body)
        .where ('id = :id', { id })
        .execute ()
      return response.status (200).json ({
        success: 'Questão atualizada com sucesso',
      })
    } catch (error) {
      return response.status (403).json ({
        error: 'Erro na alteração da questão'
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params


    const questionExists = await FAQRepository.findOne ({ where: { id } })

    if(!questionExists) {
      return response.status (404).json ({
        error: 'Questão não encontrada'
      })
    }
    
    try {
      await FAQRepository.createQueryBuilder ()
        .delete ()
        .from (FAQ)
        .where ('id = :id', { id })
        .execute ()
      return response.status (200).json ({
        success: 'Questão deletada com sucesso'
      })
    } catch (error) {
      return response.status (403).json ({
        error: 'Erro na deleção da questão'
      })
    }
  }
}

export { FAQController };