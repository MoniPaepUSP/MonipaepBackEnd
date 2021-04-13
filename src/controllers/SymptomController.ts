import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SymptomRepository } from "../repositories/SymptomRepository";

class SymptomController {
    async create(request: Request, response: Response) {
        const body = request.body

        const symptomRepository = getCustomRepository(SymptomRepository)

        const symptomAlreadyExists = await symptomRepository.findOne({
            symptom: body.symptom
        })

        if(symptomAlreadyExists) {
            return response.status(400).json({
                error: "Symptom has already been registered"
            })
        }

        const symptom = symptomRepository.create(body)

        await symptomRepository.save(symptom)

        return response.status(201).json(symptom)

    }
}

export { SymptomController }