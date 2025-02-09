import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { AssignedHealthProtocol, } from '../models';
import { AssignedHealthProtocolRepository, DiseaseRepository, HealthProtocolRepository } from '../repositories';
import logger from '../common/loggerConfig';

class AssignedHealthProtocolController {

  async create(request: Request, response: Response) {
    const body = request.body

    const isValidDisease = await DiseaseRepository.findOne ({
      where: {
        name: body.disease_name
      }
    })

    if (!isValidDisease) {
      return response.status (400).json ({
        error: 'Doença não encontrada'
      })
    }

    const isValidHealthProtocol = await HealthProtocolRepository.findOne ({
      where: {
        id: body.healthprotocol_id
      }
    })

    if (!isValidHealthProtocol) {
      return response.status (400).json ({
        error: 'Protocolo de saúde não encontrado'
      })
    }

    const isAlreadyAssigned = await AssignedHealthProtocolRepository.findOne ({
      where: {
        diseaseName: body.disease_name,
        healthProtocolId: body.healthprotocol_id
      }
    })

    if (isAlreadyAssigned) {
      return response.status (403).json ({
        error: 'Este protocolo de saúde já está atribuído à essa doença'
      })
    }

    try {
      const assignedHealthProtocolBody = AssignedHealthProtocolRepository.create (body)
      const assignedHealthProtocol = await AssignedHealthProtocolRepository.save (assignedHealthProtocolBody)

      return response.status (201).json ({
        success: 'Protocolo de saúde atribuído à essa doença com sucesso',
        assigned_health_protocol: assignedHealthProtocol
      })
    } catch (error) {
      logger.error (error);
      return response.status (403).json ({
        error: 'Erro na atribuição do protocolo de saúde à essa doença'
      })
    }
  }

  async list(request: Request, response: Response) {
    const {
      disease_name,
      healthprotocol_id,
      healthprotocol_title,
      page
    } = request.query;
    const take = 10;
    const skip = page ? (Number (page) - 1) * take : 0;
    let filters: object = {};

    if (disease_name) {
      filters = { ...filters, diseaseName: Like (`%${String (disease_name)}%`) };
    }

    if (healthprotocol_id) {
      filters = { ...filters, healthProtocol: { id: String (healthprotocol_id) } }; // Certifique-se de que o filtro corresponde ao relacionamento
    }

    // Caso exista `healthprotocol_title`, utilize `QueryBuilder`
    if (healthprotocol_title) {
      try {
        const [items, totalCount] = await AssignedHealthProtocolRepository.createQueryBuilder ('assignedHealthProtocol')
          .leftJoinAndSelect ('assignedHealthProtocol.healthProtocol', 'healthProtocols')
          .where ('healthProtocols.title LIKE :title', { title: `%${healthprotocol_title}%` })
          .skip (skip)
          .take (take)
          .getManyAndCount ();

        return response.status (200).json ({
          assignedHealthProtocols: items,
          totalAssignedHealthProtocols: totalCount,
        });
      } catch (error) {
        console.error ('Erro ao listar as associações:', error);
        return response.status (403).json ({
          error: 'Erro na listagem das associações',
        });
      }
    }

    // Utilize `findAndCount` para outros filtros
    const options: object = {
      where: filters,
      relations: ['healthProtocol'], // Carrega o relacionamento healthProtocol
      take,
      skip,
    };

    try {
      const [associationList, total] = await AssignedHealthProtocolRepository.findAndCount (options);
      return response.status (200).json ({
        assignedHealthProtocols: associationList,
        totalAssignedHealthProtocols: total,
      });
    } catch (error) {
      console.error ('Erro ao listar as associações:', error);
      return response.status (403).json ({
        error: 'Erro na listagem das associações',
      });
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { disease_name, healthprotocol_id } = request.params


    const diseaseExists = await DiseaseRepository.findOne ({
      where: {
        name: String (disease_name)
      }
    })

    if (!diseaseExists) {
      return response.status (404).json ({
        error: 'Doença não encontrada'
      })
    }

    const healthProtocolExists = await HealthProtocolRepository.findOne ({
      where: {
        id: String (healthprotocol_id)
      }
    })

    if (!healthProtocolExists) {
      return response.status (404).json ({
        error: 'Protocolo de saúde não encontrado'
      })
    }

    const associationExists = await AssignedHealthProtocolRepository.findOne ({
      where: {
        healthProtocolId: String (healthprotocol_id),
        diseaseName: String (healthprotocol_id)
      }
    })

    if (!associationExists) {
      return response.status (404).json ({
        error: 'Protocolo de saúde não associado à essa doença'
      })
    }

    try {
      await AssignedHealthProtocolRepository.createQueryBuilder ()
        .delete ()
        .from (AssignedHealthProtocol)
        .where ('healthprotocol_id = :healthprotocol_id and disease_name = :disease_name', {
          healthprotocol_id,
          disease_name
        })
        .execute ()
      return response.status (200).json ({
        success: 'Associação deletada com sucesso'
      })
    } catch (error) {
      logger.error (error);
      return response.status (403).json ({
        error: 'Erro na deleção da associação'
      })
    }
  }
}

export { AssignedHealthProtocolController }