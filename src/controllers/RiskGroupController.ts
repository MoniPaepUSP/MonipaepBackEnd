import { Request, Response } from 'express';
import { ComorbidityRepository, DiseaseRepository, RiskGroupRepository } from 'src/repositories';
import { In } from 'typeorm';

class RiskGroupController {

  async list(request: Request, response: Response) {
    const { diseaseId } = request.query;
    if (!diseaseId) {
      return response.status(400).json({
        error: "ID da doença não fornecido"
      });
    }

    const disease = await DiseaseRepository.findOne({
      where: {
        id: String(diseaseId)
      }
    });
    if (!disease) {
      return response.status(404).json({
        error: "Doença não encontrada"
      });
    }

    const riskGroups = await RiskGroupRepository.find({
      where: {
        disease
      },
      relations: ['comorbidities', 'specialConditions'],
    })

    return response.status(200).json({
      riskGroups
    })
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { comorbiditiesIds, specialConditionsIds }: {
      comorbiditiesIds: string[],
      specialConditionsIds: string[]
    } = request.body;

    // Load the risk group entity first.
    const riskGroup = await RiskGroupRepository.findOne({ where: { id } });

    if (!riskGroup) {
      return response.status(404).json({
        error: "Grupo de risco não encontrado"
      });
    }
    
    // Validate comorbidities and special conditions IDs.
    const comorbidities = await ComorbidityRepository.find({
      where: {
        id: In(comorbiditiesIds)
      }
    });
    if (comorbidities.length !== comorbiditiesIds.length) {
      return response.status(404).json({
        error: "Algumas comorbidades não foram encontradas"
      });
    }

    const specialConditions = await ComorbidityRepository.find({
      where: {
        id: In(specialConditionsIds)
      }
    });
    if (specialConditions.length !== specialConditionsIds.length) {
      return response.status(404).json({
        error: "Algumas condições especiais não foram encontradas"
      });
    }

    // Map the IDs to objects with only the id field.
    riskGroup.comorbidities = comorbidities;
    riskGroup.specialConditions = specialConditions;

    try {
      await RiskGroupRepository.save(riskGroup);
      return response.status(200).json({
        success: "Grupo de risco atualizado com sucesso"
      });
    } catch (error) {
      return response.status(400).json({
        error: "Erro na atualização do grupo de risco"
      });
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

