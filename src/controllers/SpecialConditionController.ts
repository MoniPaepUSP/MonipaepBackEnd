import { Request, Response } from "express";
import { Like } from "typeorm";
import { SpecialCondition } from "../models";
import { SpecialConditionRepository } from "../repositories";

class SpecialConditionController {
  async create(request: Request, response: Response) {
    const body = request.body;
    const { name, description } = body;

    const specialConditionAlreadyExists = await SpecialConditionRepository.findOne({
      where: {
        name,
      },
    });

    if (specialConditionAlreadyExists) {
      return response.status(403).json({
        error: "Condição especial já registrada",
      });
    }

    try {
      const specialCondition = SpecialConditionRepository.create({
        name,
        description,
      });
      await SpecialConditionRepository.save(specialCondition);

      return response.status(201).json({
        success: "Condição especial registrada com sucesso",
      });
    } catch (error) {
      return response.status(403).json({
        error: "Erro na criação da condição especial",
      });
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query;
    let filters = {};

    if (name) {
      filters = { name: Like(`%${String(name)}%`) };
    }

    let options: any = {
      where: filters,
      order: {
        name: "ASC",
      },
    };

    if (page) {
      const take = 10;
      options = { ...options, take, skip: (Number(page) - 1) * take };
    }

    const specialConditionList = await SpecialConditionRepository.findAndCount(options);

    return response.status(200).json({ specialConditionList: specialConditionList[0] });
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    try {
      await SpecialConditionRepository.createQueryBuilder()
        .delete()
        .from(SpecialCondition)
        .where("id = :id", { id })
        .execute();

      return response.status(200).json({
        success: "Condição especial deletada com sucesso",
      });
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da condição especial",
      });
    }
  }

  async alterOne(request: Request, response: Response) {
    const { id } = request.params;
    const body = request.body;

    try {
      await SpecialConditionRepository.createQueryBuilder()
        .update(SpecialCondition)
        .set(body)
        .where("id = :id", { id })
        .execute();

      return response.status(200).json({
        success: "Condição especial alterada com sucesso",
      });
    } catch (error) {
      return response.status(403).json({
        error: "Erro na alteração da condição especial",
      });
    }
  }
}

export { SpecialConditionController };