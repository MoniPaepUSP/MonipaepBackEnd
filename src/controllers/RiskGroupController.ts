import { Request, Response } from 'express';
import { RiskGroupRepository } from 'src/repositories';

class RiskGroupController {

  async list(request: Request, response: Response) {
    const { diseaseId } = request.query

    const riskGroups = await RiskGroupRepository.find({
      where: {
        diseaseId
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

    // Map the IDs to objects with only the id field.
    riskGroup.comorbidities = comorbiditiesIds.map((comorbidityId) => ({ id: comorbidityId }));
    riskGroup.specialConditions = specialConditionsIds.map((specialConditionId) => ({ id: specialConditionId }));

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

