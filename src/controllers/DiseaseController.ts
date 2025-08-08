import { Request, Response } from "express";
import { Disease, HealthProtocol, Symptom } from "../models";
import { ComorbidityRepository, DiseaseRepository, HealthProtocolRepository, SpecialConditionRepository, SymptomRepository } from "../repositories";
import { openai } from "../openai";
import { zodResponseFormat, zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

class DiseaseController {

  async create(request: Request, response: Response) {
    const {
      name,
      infectedMonitoringDays,
      suspectedMonitoringDays,
      // Expect comorbidities and specialConditions as arrays of IDs
      comorbidities: comorbiditiesIds,
      specialConditions: specialConditionsIds,
      // Expect symptoms arrays to be arrays of IDs
      symptoms: symptomIds,
      healthProtocols,
    } = request.body;

    // Create new Disease instance
    const disease = new Disease();
    disease.name = name;
    disease.infectedMonitoringDays = infectedMonitoringDays;
    disease.suspectedMonitoringDays = suspectedMonitoringDays;

    // If comorbidities and specialConditions are provided as arrays of IDs, load them
    if (comorbiditiesIds && Array.isArray(comorbiditiesIds)) {
      disease.comorbidities = await ComorbidityRepository.find({
        where: comorbiditiesIds.map((id: string) => ({ id }))
      });
    }
    if (specialConditionsIds && Array.isArray(specialConditionsIds)) {
      disease.specialConditions = await SpecialConditionRepository.find({
        where: specialConditionsIds.map((id: string) => ({ id }))
      })
    }

    // Load and assign symptoms, alarmSigns, and shockSigns if provided as arrays of IDs
    if (symptomIds && Array.isArray(symptomIds)) {
      disease.symptoms = await SymptomRepository.find({
        where: symptomIds.map((id: string) => ({ id }))
      });
    }

    // Map provided health protocols data into HealthProtocol entities
    if (healthProtocols && Array.isArray(healthProtocols)) {
      disease.healthProtocols = await Promise.all(healthProtocols.map(async (protocolData: any) => {
        const protocol = new HealthProtocol();
        protocol.gravityLevel = protocolData.gravityLevel;
        protocol.gravityLabel = protocolData.gravityLabel;
        protocol.instructions = protocolData.instructions;
        protocol.symptoms = protocolData.symptoms;
        protocol.referUSM = protocolData.referUSM;
        protocol.diseaseId = protocolData.diseaseId;
        return protocol;
      }));
    }

    try {
      // Save the Disease which cascades and saves the healthProtocols automatically.
      const createdDisease = await DiseaseRepository.save(disease);
      return response.status(201).json(createdDisease);
    } catch (error) {
      console.error("Error creating disease:", error);
      return response.status(500).json({ error: "Erro ao criar a doença" });
    }
  }

  async list(request: Request, response: Response) {
    const { name, page } = request.query;

    const take = 10;
    const skip = (Number(page) - 1) * take;

    // Step 1: Basic disease info only (no many-to-many joins here)
    const baseQuery = DiseaseRepository.createQueryBuilder("disease")
      .leftJoinAndSelect("disease.symptoms", "symptom")
      .leftJoinAndSelect("disease.healthProtocols", "healthProtocol")
      .leftJoinAndSelect("healthProtocol.symptoms", "hsymptoms")

    if (name) {
      baseQuery.where("disease.name ILIKE :name", { name: `%${name}%` });
    }

    baseQuery.orderBy("disease.name", "ASC").take(take).skip(skip);

    const [diseases, total] = await baseQuery.getManyAndCount();

    if (diseases.length > 0) {
      const ids = diseases.map(d => d.id);

      const withComorbidities = await DiseaseRepository.createQueryBuilder("disease")
        .leftJoinAndSelect("disease.comorbidities", "comorbidity")
        .where("disease.id IN (:...ids)", { ids })
        .getMany();

      const withSpecialConditions = await DiseaseRepository.createQueryBuilder("disease")
        .leftJoinAndSelect("disease.specialConditions", "specialCondition")
        .where("disease.id IN (:...ids)", { ids })
        .getMany();

      const comorbidityMap = new Map(
        withComorbidities.map(d => [d.id, d.comorbidities])
      );
      const specialConditionMap = new Map(
        withSpecialConditions.map(d => [d.id, d.specialConditions])
      );

      for (const disease of diseases) {
        disease.comorbidities = comorbidityMap.get(disease.id) || [];
        disease.specialConditions = specialConditionMap.get(disease.id) || [];
      }
    } else {
      // No diseases → make sure these fields are empty arrays
      for (const disease of diseases) {
        disease.comorbidities = [];
        disease.specialConditions = [];
      }
    }

    return response.status(200).json({ diseases, totalDiseases: total });
  }

  async alterOne(request: Request, response: Response) {
    const { id } = request.params;
    const {
      name,
      infectedMonitoringDays,
      suspectedMonitoringDays,
      // Expect comorbidities and specialConditions as arrays of IDs
      comorbidities: comorbiditiesIds,
      specialConditions: specialConditionsIds,
      // Expect symptoms arrays to be arrays of IDs
      symptoms: symptomIds,
      healthProtocols,
    } = request.body;

    console.log(request.body);

    // Find the existing disease, including relations to update them if provided
    const query = DiseaseRepository.createQueryBuilder("disease")
      .leftJoinAndSelect("disease.symptoms", "symptom")
      .leftJoinAndSelect("disease.healthProtocols", "healthProtocol")
      .leftJoinAndSelect("disease.comorbidities", "comorbidity")
      .leftJoinAndSelect("disease.specialConditions", "specialCondition")
      .where("disease.id = :id", { id });

    const disease = await query.getOne();

    if (!disease) {
      return response.status(404).json({ error: "Doença não encontrada" });
    }

    // Update primitive fields
    disease.name = name;
    disease.infectedMonitoringDays = infectedMonitoringDays;
    disease.suspectedMonitoringDays = suspectedMonitoringDays;

    // If comorbidities and specialConditions are provided as arrays of IDs, load them
    if (comorbiditiesIds && Array.isArray(comorbiditiesIds)) {
      disease.comorbidities = await ComorbidityRepository.find({
        where: comorbiditiesIds.map((id: string) => ({ id }))
      });
    }
    if (specialConditionsIds && Array.isArray(specialConditionsIds)) {
      disease.specialConditions = await SpecialConditionRepository.find({
        where: specialConditionsIds.map((id: string) => ({ id }))
      })
    }

    // Load and assign symptoms, alarmSigns, and shockSigns if provided as arrays of IDs
    if (symptomIds && Array.isArray(symptomIds)) {
      disease.symptoms = await SymptomRepository.find({
        where: symptomIds.map((id: string) => ({ id }))
      });
    }

    // Update health protocols by replacing with new ones if provided.
    // Depending on your business rules, you might update existing protocols rather than replacing them.
    if (healthProtocols && Array.isArray(healthProtocols)) {
      await HealthProtocolRepository.delete({ disease: { id } });

      disease.healthProtocols = await Promise.all(healthProtocols.map(async (protocolData: any) => {
        const protocol = new HealthProtocol();
        protocol.gravityLevel = protocolData.gravityLevel;
        protocol.gravityLabel = protocolData.gravityLabel;
        protocol.instructions = protocolData.instructions;
        protocol.symptoms = protocolData.symptoms;
        protocol.referUSM = protocolData.referUSM;
        protocol.diseaseId = protocolData.diseaseId;
        return protocol;
      }));
    }

    try {
      // Save the updated Disease. Cascading options ensure that related entities are also persisted.
      const updatedDisease = await DiseaseRepository.save(disease);
      return response.status(200).json(updatedDisease);
    } catch (error) {
      console.error("Error updating disease:", error);
      return response.status(500).json({ error: "Erro ao atualizar a doença" });
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params

    const isValidDisease = await DiseaseRepository.findOne({
      where: {
        id
      }
    })

    if (!isValidDisease) {
      return response.status(404).json({
        error: "Doença não encontrada"
      })
    }

    try {
      await DiseaseRepository.createQueryBuilder()
        .delete()
        .from(Disease)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Doença deletada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção da doença"
      })
    }
  }

  async generateWithGPT(request: Request, response: Response) {
    const { name } = request.body;

    // Schema for the disease data
    const DiseaseInitialSchema = z.object({
      name: z.string(),
      infectedMonitoringDays: z.number(),
      suspectedMonitoringDays: z.number()
    });

    // Prompt for disease data
    const diseasePrompt = `
    Dada a doença "${name}", retorne um JSON com os seguintes dados:
    {
      "name": "<nome da doença>",
      "infectedMonitoringDays": <número de dias de monitoramento para paciente infectado>,
      "suspectedMonitoringDays": <número de dias de monitoramento para paciente com suspeita>
    }

    Regras importantes:
    - Use valores realistas para os dias de monitoramento.
    `;

    const diseaseCompletion = await openai.responses.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: diseasePrompt },
        { role: 'user', content: name }
      ],
      text: {
        format: zodTextFormat(DiseaseInitialSchema, 'diseaseInitialSchema')
      }
    });
    const diseaseData = diseaseCompletion.output_parsed;
    if (!diseaseData) {
      return response.status(404).json({ error: "Erro ao gerar os dados iniciais da doença" });
    }
    console.log("Dados da doença:", diseaseData);

    /** ======================================================================
     *  Available Data Lists (Symptoms, Comorbidities, Special Conditions)
     *  ====================================================================== */

    // Symptoms
    const availableSymptoms = await SymptomRepository.find();
    const availableSymptomsList = availableSymptoms.map(symptom => ({
      id: symptom.id,
      name: symptom.name
    }));

    // Comorbidities
    const availableComorbidities = await ComorbidityRepository.find();
    const availableComorbiditiesList = availableComorbidities.map(comorbidity => ({
      id: comorbidity.id,
      name: comorbidity.name
    }));

    // Special Conditions
    const availableSpecialConditions = await SpecialConditionRepository.find();
    const availableSpecialConditionsList = availableSpecialConditions.map(specialCondition => ({
      id: specialCondition.id,
      name: specialCondition.name
    }));

    // Schema for symptoms IDs
    const SymptomsSchema = z.object({
      symptomIds: z.array(z.string())
    });

    // Prompt for symptom IDs
    const symptomsPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "symptomIds": ["id1", "id2", ...]
    }
    
    Selecione apenas os IDs dos sintomas que devem ser incluídos no tratamento, 
    considerando apenas os sintomas listados abaixo:
    ${JSON.stringify(availableSymptomsList, null, 2)}
    
    Atenção: retorne apenas os IDs válidos.
  `;
    const symptomsCompletion = await openai.responses.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: symptomsPrompt },
        { role: 'user', content: name }
      ],
      text: {
        format: zodTextFormat(SymptomsSchema, 'symptomsSchema')
      }
    });
    const symptomsData = symptomsCompletion.output_parsed;
    const symptomIds = symptomsData?.symptomIds ?? [];
    if (!symptomIds.length) {
      return response.status(404).json({ error: "Erro ao revisar os sintomas" });
    }
    console.log("IDs dos Sintomas:", symptomIds);

    /** ======================================================================
     *  Risk Groups Generation
     *  ====================================================================== */

    // Schema for comorbidities (comorbidities and special conditions)
    const ComorbiditiesSchema = z.object({
      comorbiditiesIds: z.array(z.string())
    });

    // Prompt for comorbidities
    const comorbiditiesPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "comorbiditiesIds": ["id1", "id2", ...]
    }
    
    Selecione os IDs das comorbidades que devem ser consideradas grupos de risco,
    usando a lista abaixo:
    ${JSON.stringify(availableComorbiditiesList, null, 2)}
  `;
    const comorbiditiesCompletion = await openai.responses.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: comorbiditiesPrompt },
        { role: 'user', content: name }
      ],
      text: {
        format: zodTextFormat(ComorbiditiesSchema, 'comorbiditiesSchema')
      }
    });
    const comorbiditiesData = comorbiditiesCompletion.output_parsed;
    const comorbiditiesIds = comorbiditiesData?.comorbiditiesIds ?? [];
    if (!comorbiditiesIds.length) {
      return response.status(404).json({ error: "Erro ao gerar os dados iniciais das comorbidades" });
    }
    console.log("IDs das comorbidades", comorbiditiesIds);

    // Schema for special conditions
    const SpecialConditionsSchema = z.object({
      specialConditionsIds: z.array(z.string())
    });
    // Prompt for special conditions
    const specialConditionsPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "specialConditionsIds": ["id1", "id2", ...]
    }

    Selecione os IDs das condições especiais que devem ser consideradas grupos de risco,
    usando a lista abaixo:
    ${JSON.stringify(availableSpecialConditionsList, null, 2)}
    `;

    const specialConditionsCompletion = await openai.responses.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: specialConditionsPrompt },
        { role: 'user', content: name }
      ],
      text: {
        format: zodTextFormat(SpecialConditionsSchema, 'specialConditionsSchema')
      }
    });
    const specialConditionsData = specialConditionsCompletion.output_parsed;
    const specialConditionsIds = specialConditionsData?.specialConditionsIds ?? [];
    if (!specialConditionsIds.length) {
      return response.status(404).json({ error: "Erro ao gerar os dados iniciais das condições especiais" });
    }
    console.log("IDs das condições especiais:", specialConditionsIds);


    /** ======================================================================
     *  Final Assembly and Saving of Disease Data
     *  ====================================================================== */
    try {
      // Create Disease instance
      const disease = new Disease();
      disease.name = name;
      disease.infectedMonitoringDays = diseaseData.infectedMonitoringDays;
      disease.suspectedMonitoringDays = diseaseData.suspectedMonitoringDays;

      // Set up Risk Groups
      disease.comorbidities = availableComorbidities.filter(c => comorbiditiesIds.includes(c.id));
      disease.specialConditions = availableSpecialConditions.filter(sc => specialConditionsIds.includes(sc.id));

      // Map symptoms, alarm signs, and shock signs
      disease.symptoms = availableSymptoms.filter(s => symptomIds.includes(s.id));

      // Save the complete disease record with all associations
      const createdDisease = await DiseaseRepository.save(disease);
      return response.status(201).json(createdDisease);
    } catch (error) {
      console.error("Erro ao criar doença a partir dos dados do GPT:", error);
      return response.status(500).json({ error: `Erro ao criar doença a partir dos dados gerados: ${error}` });
    }
  }
}

export { DiseaseController }