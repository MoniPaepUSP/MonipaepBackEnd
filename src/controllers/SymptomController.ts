import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { Symptom } from '../models';
import { SymptomRepository } from '../repositories/SymptomRepository';
import logger from '../common/loggerConfig';

class SymptomController {
  

  async create(request: Request, response: Response) {
    const body = request.body


    const symptomAlreadyExists = await SymptomRepository.findOne ({
      where: {
        symptom: body.symptom
      }
    })

    if(symptomAlreadyExists) {
      return response.status (403).json ({
        error: 'Sintoma já registrado'
      })
    }

    try {
      const symptom = SymptomRepository.create (body)
      await SymptomRepository.save (symptom)
  
      return response.status (201).json ({
        success: 'Sintoma registrado com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na criação do sintoma'
      })
    }
  }

  async list(request: Request, response: Response) {
    const { symptom, page } = request.query
    let filters = {}
    

    if(symptom) {
      filters = { symptom: Like (`%${String (symptom)}%`) }
    } 

    let options: object = {
      where: filters,
      order: {
        symptom: 'ASC'
      },
    }

    if(page) {
      const take = 10
      options = { ...options, take, skip: ((Number (page) - 1) * take) }
    }

    const symptomsList = await SymptomRepository.findAndCount (options)

    return response.status (200).json ({
      symptoms: symptomsList[0],
      totalSymptoms: symptomsList[1]
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { symptom } = request.params

    const isValidSymptom = await SymptomRepository.findOne ({ where: { symptom } })

    if(!isValidSymptom) {
      return response.status (404).json ({
        error: 'Sintoma não encontrado'
      })
    }

    try {
      await SymptomRepository.createQueryBuilder ()
        .update (Symptom)
        .set (body)
        .where ('symptom = :symptom', { symptom })
        .execute ()
      return response.status (200).json ({
        success: 'Sintoma atualizado com sucesso',
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na atualização do sintoma'
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { symptom } = request.params

    const isValidSymptom = await SymptomRepository.findOne ({ where: { symptom } })

    if(!isValidSymptom) {
      return response.status (404).json ({
        error: 'Sintoma não encontrado'
      })
    }

    try {
      await SymptomRepository.createQueryBuilder ()
        .delete ()
        .from (Symptom)
        .where ('symptom = :symptom', { symptom })
        .execute ()
      return response.status (200).json ({
        success: 'Sintoma deletado com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na deleção do sintoma'
      })
    }
  }
}

export { SymptomController }