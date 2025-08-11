import { Request, Response } from "express";
import { getManager, Like, Repository } from "typeorm";
import { USM } from "../models";
// import { AppDataSource } from "../database";
import { USMRepository } from "../repositories";
import { getMedicalUnits, Place } from "../lib/getMedicalUnits";
class USMController {

  async create(request: Request, response: Response) {
    const body = request.body

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
        type: body.type === "UPA" || body.type === "UBS" ? body.type : null
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

  async bulkCreate(request: Request, response: Response) {
    const body = request.body
    if (!Array.isArray(body.usms) || body.length === 0) {
      return response.status(400).json({
        error: "Corpo da requisição inválido"
      })
    }

    const usmsToCreate = body.usms.map((usm: any) => ({
      id: usm.id,
      name: usm.displayName.text,
      number: usm.addressComponents[0].shortText,
      street: usm.addressComponents[1].shortText,
      neighborhood: usm.addressComponents[2].shortText,
      city: usm.addressComponents[3].shortText,
      state: usm.addressComponents[4].shortText,
      weekdayDescriptions: usm.regularOpeningHours?.weekdayDescriptions,
      latitude: usm.location.latitude,
      longitude: usm.location.longitude,
      type: usm.type === "UPA" || usm.type === "UBS" ? usm.type : null
    }));

    const existingUsms = await USMRepository.find(usmsToCreate.map((usm: any) => usm.id));
    const existingIds = new Set(existingUsms.map((usm: any) => usm.id));
    const newUsms = usmsToCreate.filter((usm: any) => !existingIds.has(usm.id));
    if (newUsms.length === 0) {
      return response.status(400).json({
        error: "Todas as unidades de saúde já estão cadastradas"
      });
    }

    try {
      const usmEntities = USMRepository.create(newUsms);
      await USMRepository.save(usmEntities);

      return response.status(201).json({
        success: "Unidades de saúde cadastradas com sucesso"
      });
    } catch (error) {
      return response.status(403).json({
        error: "Erro no cadastro das unidades de saúde"
      });
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

  async listCloseBy(request: Request, response: Response) {
    const { latitude, longitude, radius, type } = request.query
    if (!latitude || !longitude || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return response.status(400).json({
        error: "Latitude e longitude são obrigatórios"
      })
    }

    const lat = parseFloat(String(latitude));
    const lon = parseFloat(String(longitude));
    const rad = radius ? parseFloat(String(radius)) : 10000; // Default radius is 10000 meters
    const typeFilter = type ? String(type).toUpperCase() : null;

    // bounding box
    const R = 6371000; // metros
    const latRad = lat * Math.PI / 180;
    const deltaLatDeg = (rad / R) * (180 / Math.PI);
    const deltaLonDeg = (rad / R) * (180 / Math.PI) / Math.cos(latRad);

    const minLat = lat - deltaLatDeg;
    const maxLat = lat + deltaLatDeg;
    const minLon = lon - deltaLonDeg;
    const maxLon = lon + deltaLonDeg;

    // distance expression for Haversine formula
    const distanceExpr = `
    2 * 6371000 * asin(
      sqrt(
        power(sin(radians(usm.latitude - ${lat}) / 2), 2) +
        cos(radians(${lat})) * cos(radians(usm.latitude)) *
        power(sin(radians(usm.longitude - ${lon}) / 2), 2)
      )
    )
  `;

    // Base SQL
    let sqlWhere = `
    SELECT usm.*, (${distanceExpr}) AS distance_m
    FROM usm
    WHERE usm.latitude BETWEEN $1 AND $2
      AND usm.longitude BETWEEN $3 AND $4
      AND (${distanceExpr}) <= $5
  `;

    const params: any[] = [minLat, maxLat, minLon, maxLon, rad];
    if (typeFilter) {
      sqlWhere += ` AND UPPER(usm.type) = $6`;
      params.push(typeFilter);
    }

    sqlWhere += ` ORDER BY distance_m ASC`;

    try {
      const usms = await USMRepository.query(sqlWhere, params);
      return response.status(200).json({ usms });
    } catch (err: any) {
      console.error(err);
      return response.status(500).json({ error: 'Erro no banco' });
    }
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
    const state = typeof request.query.state === 'string' ? request.query.state : undefined;
    const city = typeof request.query.city === 'string' ? request.query.city : undefined;
    const neighborhood = typeof request.query.neighborhood === 'string' ? request.query.neighborhood : undefined;
    const nextPageTokenUBS = typeof request.query.nextPageTokenUBS === 'string' ? request.query.nextPageTokenUBS : undefined;
    const nextPageTokenUPA = typeof request.query.nextPageTokenUPA === 'string' ? request.query.nextPageTokenUPA : undefined;

    if (!state || !city) {
      return response.status(400).json({
        error: "Estado e cidade são obrigatórios"
      })
    }

    try {
      const medicalUnits = await getMedicalUnits({ state, city, neighborhood, nextPageTokenUBS, nextPageTokenUPA });
      return response.status(200).json(medicalUnits)
    } catch (error) {
      console.error("Erro ao buscar unidades de saúde:", error);
      return response.status(403).json({
        error: "Erro na busca de unidades de saúde"
      })
    }
  }
}

export { USMController }