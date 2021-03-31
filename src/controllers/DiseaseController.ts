import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { DiseaseRepository } from "../repositories";

class DiseaseController{
    async create(request: Request, response: Response){
        const body = request.body

        const diseaseRepository = getCustomRepository(DiseaseRepository)

        const diseaseAlreadyExists = await diseaseRepository.findOne({
            name: body.name
        })

        //console.log('resultado = '+ diseaseAlreadyExists)
        if(diseaseAlreadyExists){
            return response.status(400).json({
                error: "This disease is already registered in the system"
            })
        }
        const disease = diseaseRepository.create(body)

        await diseaseRepository.save(disease)

        return response.status(201).json(disease)
    }
}

export{DiseaseController}