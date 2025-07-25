import { Request, Response } from "express";
import { Like, Repository } from "typeorm";
import { USM } from "../models";
// import { AppDataSource } from "src/database";
import { USMRepository } from "../repositories";
import { getMedicalUnits, Place } from "src/lib/getMedicalUnits";
class USMController {

  async create(request: Request, response: Response) {
    const body: Place = request.body

    const usmAlreadyExists = await USMRepository.findOne({
      where: {
        id: body.id
      }
    })

    if (usmAlreadyExists) {
      return response.status(400).json({
        error: "Unidade de saúde já registrada"
      })
    }

    try {
      const usm = USMRepository.create({
        id: body.id,
        name: body.displayName.text,
        number: body.addressComponents[0].shortText,
        street: body.addressComponents[1].shortText,
        neighborhood: body.addressComponents[2].shortText,
        city: body.addressComponents[3].shortText,
        state: body.addressComponents[4].shortText,
        weekdayDescriptions: body.regularOpeningHours.weekdayDescriptions,
        latitude: body.location.latitude,
        longitude: body.location.longitude,
      })
      await USMRepository.save(usm)

      return response.status(201).json({
        success: "Unidade de saúde cadastrada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro no cadastro da unidade de saúde"
      })
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query
    let filters = {}

    if (name) {
      filters = { ...filters, name: Like(`%${String(name)}%`) }
    }

    let options: any = {
      where: filters,
      order: {
        name: 'ASC'
      },
    }

    if (page) {
      const take = 10
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const usmList = await USMRepository.findAndCount(options)

    return response.status(200).json({
      usms: usmList[0],
      totalUsms: usmList[1]
    })
  }

  async alterOne(request: Request, response: Response) {
    const body = request.body
    const { id } = request.params

    const isValidUsm = await USMRepository.findOne({ where: { id } })

    if (!isValidUsm) {
      return response.status(404).json({
        error: "Unidade de saúde não encontrada"
      })
    }

    try {
      await USMRepository.createQueryBuilder()
        .update(USM)
        .set(body)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Unidade de saúde alterada com sucesso",
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização da unidade de saúde"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params

    const isValidUsm = await USMRepository.findOne({ where: { id } })

    if (!isValidUsm) {
      return response.status(404).json({
        error: "Unidade de saúde não encontrada"
      })
    }

    try {
      await USMRepository.createQueryBuilder()
        .delete()
        .from(USM)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Unidade de saúde deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da unidade de saúde"
      })
    }
  }

  async getGooglePlaces(request: Request, response: Response) {
    const { state, city, neighborhood, nextPageTokenUBS, nextPageTokenUPA } = request.body;

    try {
      const medicalUnits = await getMedicalUnits({ state, city, neighborhood, nextPageTokenUBS, nextPageTokenUPA });
      return response.status(200).json(medicalUnits)
    } catch (error) {
      return response.status(403).json({
        error: "Erro na busca de unidades de saúde"
      })
    }
  }
}

export { USMController }