import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { Disease } from '../models';
import { DiseaseRepository } from '../repositories';
import logger from '../common/loggerConfig';

class DiseaseController {
  

  async create(request: Request, response: Response) {
    const body = request.body



    const diseaseAlreadyExists = await DiseaseRepository.findOne ({
      where: {
        name: body.name
      }
    })

    if(diseaseAlreadyExists) {
      return response.status (403).json ({
        error: 'Doença já registrada'
      })
    }
    
    try {
      const disease = DiseaseRepository.create (body)
      await DiseaseRepository.save (disease)

      return response.status (201).json ({
        success: 'Doença registrada com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (400).json ({
        error: 'Erro no registro da doença'
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query
    let filters = {}

    // const diseaseRepository = getCustomRepository(DiseaseRepository)
    // const diseaseRepository = AppDataSource.getRepository(Disease);


    if(name) {
      filters = { name: Like (`%${String (name)}%`) }
    }

    let options: object = {
      where: filters,
      order: {
        name: 'ASC'
      },
    }

    if(page) {
      const take = 10
      options = { ...options, take, skip: ((Number (page) - 1) * take) }
    }

    const diseaseList = await DiseaseRepository.findAndCount (options)

    return response.status (200).json ({
      diseases: diseaseList[0],
      totalDiseases: diseaseList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { name } = request.params

    // const diseaseRepository = getCustomRepository(DiseaseRepository)
    // const diseaseRepository = 

    const isValidDisease = await DiseaseRepository.findOne (
      {
        where: { 
          name
        } 
      })
    
    if(!isValidDisease) {
      return response.status (404).json ({
        error: 'Doença não encontrada'
      })
    }

    try {
      await DiseaseRepository.createQueryBuilder ()
        .update (Disease)
        .set (body)
        .where ('name = :name', { name })
        .execute ();
      return response.status (200).json ({
        success: 'Doença atualizada com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na atualização da doença'
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { name } = request.params

    // const diseaseRepository = getCustomRepository(DiseaseRepository)
    // const diseaseRepository = AppDataSource.getRepository(Disease);


    const isValidDisease = await DiseaseRepository.findOne ({ 
      where: {
        name
      } 
    })
    
    if(!isValidDisease) {
      return response.status (404).json ({
        error: 'Doença não encontrada'
      })
    }
    
    try {
      await DiseaseRepository.createQueryBuilder ()
        .delete ()
        .from (Disease)
        .where ('name = :name', { name })
        .execute ();
      return response.status (200).json ({
        success: 'Doença deletada com sucesso'
      })
    } catch (error) {
      logger.error(error);
      return response.status (403).json ({
        error: 'Erro na deleção da doença'
      })
    }
  }
}

export { DiseaseController }