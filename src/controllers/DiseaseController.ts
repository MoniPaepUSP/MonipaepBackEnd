import { Request, Response } from "express";
import { Disease, HealthProtocol, RiskGroups, Symptom } from "../models";
import { ComorbidityRepository, DiseaseRepository, RiskGroupRepository, SpecialConditionRepository, SymptomRepository } from "../repositories";
import { openai } from "src/openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { DiseaseKeySymptom } from "src/models/DiseaseKeySymptom";
import { DiseaseKeySymptomRepository } from "src/repositories/DiseaseKeySymptomRepository";
import { Like } from "typeorm";

class DiseaseController {

  async create(request: Request, response: Response) {
    const {
      name,
      infectedMonitoringDays,
      suspectedMonitoringDays,
      // Expect riskGroups to include comorbidities and specialConditions as arrays of IDs
      riskGroups: riskGroupsData,
      // Expect symptoms arrays to be arrays of IDs
      symptoms: symptomIds,
      alarmSigns: alarmSignIds,
      shockSigns: shockSignIds,
      // Expect healthProtocols as an array of objects: { severity, instructions }
      healthProtocols: healthProtocolsData,
    } = request.body;

    // Create new Disease instance
    const disease = new Disease();
    disease.name = name;
    disease.infectedMonitoringDays = infectedMonitoringDays;
    disease.suspectedMonitoringDays = suspectedMonitoringDays;

    // Create and assign the risk groups entity
    const riskGroups = new RiskGroups();
    // If comorbidities and specialConditions are provided as arrays of IDs, load them:
    if (riskGroupsData) {
      if (riskGroupsData.comorbidities && Array.isArray(riskGroupsData.comorbidities)) {
        riskGroups.comorbidities = await ComorbidityRepository.find({
          where: riskGroupsData.comorbidities.map((id: string) => ({ id }))
        });
      }
      if (riskGroupsData.specialConditions && Array.isArray(riskGroupsData.specialConditions)) {
        riskGroups.specialConditions = await SpecialConditionRepository.find({
          where: riskGroupsData.specialConditions.map((id: string) => ({ id }))
        })
      }
    }

    // Save risk group first so that its id is generated (if needed)
    const savedRiskGroup = await RiskGroupRepository.save(riskGroups);
    disease.riskGroups = savedRiskGroup;

    // Load and assign symptoms, alarmSigns, and shockSigns if provided as arrays of IDs
    if (symptomIds && Array.isArray(symptomIds)) {
      disease.symptoms = await SymptomRepository.find({
        where: symptomIds.map((id: string) => ({ id }))
      });
    }
    if (alarmSignIds && Array.isArray(alarmSignIds)) {
      disease.alarmSigns = await SymptomRepository.find({
        where: alarmSignIds.map((id: string) => ({ id }))
      });
    }
    if (shockSignIds && Array.isArray(shockSignIds)) {
      disease.shockSigns = await SymptomRepository.find({
        where: shockSignIds.map((id: string) => ({ id }))
      });
    }

    // Map provided health protocols data into HealthProtocol entities
    if (healthProtocolsData && Array.isArray(healthProtocolsData)) {
      disease.healthProtocols = healthProtocolsData.map((protocolData: any) => {
        const protocol = new HealthProtocol();
        protocol.severity = protocolData.severity;
        protocol.instructions = protocolData.instructions;
        return protocol;
      });
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
    const { name, page } = request.query
    let filters = {}
    
    if (name) {
      filters = { name: Like(`%${String(name)}%`) }
    }

    let options: any = {
      where: filters,
      order: {
        name: "ASC"
      },
      relations: ["riskGroups", "symptoms", "alarmSigns", "shockSigns", "healthProtocols"],
    }

    if (page) {
      const take = 10
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const diseaseList = await DiseaseRepository.findAndCount(options)

    return response.status(200).json({
      diseases: diseaseList[0],
      totalDiseases: diseaseList[1],
    })
  }

  async alterOne(request: Request, response: Response) {
    const { id } = request.params;
    const {
      name,
      infectedMonitoringDays,
      suspectedMonitoringDays,
      // Expect riskGroups to include comorbidities and specialConditions as arrays of IDs
      riskGroups: riskGroupsData,
      // Expect symptoms arrays to be arrays of IDs
      symptoms: symptomIds,
      alarmSigns: alarmSignIds,
      shockSigns: shockSignIds,
      // Expect healthProtocols as an array of objects: { severity, instructions }
      healthProtocols: healthProtocolsData,
    } = request.body;

    // Find the existing disease, including relations to update them if provided
    const disease = await DiseaseRepository.findOne({
      where: {
        id
      },
      relations: ["riskGroups", "symptoms", "alarmSigns", "shockSigns", "healthProtocols"],
    });

    if (!disease) {
      return response.status(404).json({ error: "Doença não encontrada" });
    }

    // Update primitive fields
    disease.name = name;
    disease.infectedMonitoringDays = infectedMonitoringDays;
    disease.suspectedMonitoringDays = suspectedMonitoringDays;

    // Update risk groups if provided
    if (riskGroupsData) {
      let riskGroups = disease.riskGroups;
      if (!riskGroups) {
        riskGroups = new RiskGroups();
      }
      if (riskGroupsData.comorbidities && Array.isArray(riskGroupsData.comorbidities)) {
        riskGroups.comorbidities = await ComorbidityRepository.find({
          where: riskGroupsData.comorbidities.map((id: string) => ({ id }))
        });
      }
      if (riskGroupsData.specialConditions && Array.isArray(riskGroupsData.specialConditions)) {
        riskGroups.specialConditions = await SpecialConditionRepository.find({
          where: riskGroupsData.specialConditions.map((id: string) => ({ id }))
        })
      }
      // Save or update the risk groups entity and assign it back to disease
      const savedRiskGroups = await RiskGroupRepository.save(riskGroups);
      disease.riskGroups = savedRiskGroups;
    }

    // Update many-to-many associations with symptoms, alarmSigns, and shockSigns
    if (symptomIds && Array.isArray(symptomIds)) {
      disease.symptoms = await SymptomRepository.find({
        where: symptomIds.map((id: string) => ({ id })),
      });
    }
    if (alarmSignIds && Array.isArray(alarmSignIds)) {
      disease.alarmSigns = await SymptomRepository.find({
        where: alarmSignIds.map((id: string) => ({ id })),
      });
    }
    if (shockSignIds && Array.isArray(shockSignIds)) {
      disease.shockSigns = await SymptomRepository.find({
        where: shockSignIds.map((id: string) => ({ id })),
      });
    }

    // Update health protocols by replacing with new ones if provided.
    // Depending on your business rules, you might update existing protocols rather than replacing them.
    if (healthProtocolsData && Array.isArray(healthProtocolsData)) {
      disease.healthProtocols = healthProtocolsData.map((protocolData: any) => {
        const protocol = new HealthProtocol();
        protocol.severity = protocolData.severity;
        protocol.instructions = protocolData.instructions;
        return protocol;
      });
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
      suspectedMonitoringDays: z.number(),
      healthProtocols: z.array(
        z.object({
          severity: z.enum(["leve", "moderado", "grave", "muito grave"]),
          instructions: z.string()
        })
      )
    });

    // Prompt for disease data
    const diseasePrompt = `
    Dada a doença "${name}", retorne um JSON com os seguintes dados:
    {
      "name": "<nome da doença>",
      "infectedMonitoringDays": <número de dias de monitoramento para paciente infectado>,
      "suspectedMonitoringDays": <número de dias de monitoramento para paciente com suspeita>,
      "healthProtocols": [
        {
          "severity": "<leve | moderado | grave | muito grave>",
          "instructions": "<instrução simples para o protocolo de saúde>"
        },
        ...
      ]
    }

    Regras importantes:
    - Gere de 3 a 6 protocolos para cada gravidade (leve, moderado, grave, muito grave), se fizer sentido para a doença.
    - Os protocolos devem conter instruções clínicas simples e úteis.
    - Use valores realistas para os dias de monitoramento.
    - Caso alguma gravidade não seja aplicável à doença, você pode omiti-la, mas apenas se realmente não fizer sentido.

    Exemplo de instruções: "Manter repouso", "Hidratar-se bem", "Procurar atendimento médico em caso de febre alta", etc.
    `;

    const diseaseCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: diseasePrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(DiseaseInitialSchema, 'diseaseInitialSchema')
    });
    const diseaseData = diseaseCompletion.choices[0].message.parsed;
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
    const symptomsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: symptomsPrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(SymptomsSchema, 'symptomsSchema')
    });
    const symptomsData = symptomsCompletion.choices[0].message.parsed;
    const symptomIds = symptomsData?.symptomIds ?? [];
    if (!symptomIds.length) {
      return response.status(404).json({ error: "Erro ao revisar os sintomas" });
    }
    console.log("IDs dos Sintomas:", symptomIds);

    /** ======================================================================
     *  Alarm Signs Generation
     *  ====================================================================== */

    // Schema for alarm signs IDs
    const AlarmSignsSchema = z.object({
      alarmSignIds: z.array(z.string())
    });

    // Prompt for alarm signs
    const alarmSignsPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "alarmSignIds": ["id1", "id2", ...]
    }
    
    Selecione os IDs dos sintomas que podem ser considerados sinais de alarme, 
    a partir da seguinte lista:
    ${JSON.stringify(availableSymptomsList, null, 2)}
    
    Retorne apenas os IDs válidos.
  `;
    const alarmSignsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: alarmSignsPrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(AlarmSignsSchema, 'alarmSignsSchema')
    });
    const alarmSignsData = alarmSignsCompletion.choices[0].message.parsed;
    const alarmSignIds = alarmSignsData?.alarmSignIds ?? [];
    if (!alarmSignIds.length) {
      return response.status(404).json({ error: "Erro ao revisar os sinais de alarme" });
    }
    console.log("IDs dos Sinais de Alarme:", alarmSignIds);

    /** ======================================================================
     *  Shock Signs Generation
     *  ====================================================================== */

    // Schema for shock signs IDs
    const ShockSignsSchema = z.object({
      shockSignIds: z.array(z.string())
    });

    // Prompt for shock signs
    const shockSignsPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "shockSignIds": ["id1", "id2", ...]
    }
    
    Selecione os IDs dos sintomas que podem ser considerados sinais de choque, 
    usando a lista abaixo:
    ${JSON.stringify(availableSymptomsList, null, 2)}
    
    Retorne apenas os IDs válidos.
  `;
    const shockSignsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: shockSignsPrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(ShockSignsSchema, 'shockSignsSchema')
    });
    const shockSignsData = shockSignsCompletion.choices[0].message.parsed;
    const shockSignIds = shockSignsData?.shockSignIds ?? [];
    if (!shockSignIds.length) {
      return response.status(404).json({ error: "Erro ao revisar os sinais de choque" });
    }
    console.log("IDs dos Sinais de Choque:", shockSignIds);

    /** ======================================================================
     *  Key Symptoms and Weights Generation
     *  ====================================================================== */

    // Schema for key symptoms and weights
    const KeySymptomsSchema = z.object({
      keySymptoms: z.array(
        z.object({
          id: z.string(),
          weight: z.number()
        })
      )
    });
    // Prompt for key symptoms and weights
    const keySymptomsPrompt = `
    Dada a doença "${name}", retorne um JSON no seguinte formato:
    {
      "keySymptoms": [
        { "id": "id1", "weight": 0.5 },
        { "id": "id2", "weight": 0.8 },
        ...
      ]
    }
    Selecione entre 3 a 5 IDs dos sintomas marcantes da doença, que o diferenciam de outros,
    utilizando a lista abaixo:
    ${JSON.stringify(availableSymptomsList, null, 2)}
    Atribua um peso entre 0 e 1 para cada sintoma, onde 0 significa que o sintoma não é relevante e 1 significa que é extremamente relevante.
    Retorne apenas os IDs encontrados na lista.
  `;
    const keySymptomsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: keySymptomsPrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(KeySymptomsSchema, 'keySymptomsSchema')
    });
    const keySymptomsData = keySymptomsCompletion.choices[0].message.parsed;
    const keySymptoms = keySymptomsData?.keySymptoms ?? [];
    if (!keySymptoms.length) {
      return response.status(404).json({ error: "Erro ao revisar os sintomas-chave" });
    }
    console.log("Sintomas-chave e pesos:", keySymptoms);

    /** ======================================================================
     *  Risk Groups Generation
     *  ====================================================================== */

    // Schema for risk groups (comorbidities and special conditions)
    const RiskGroupsSchema = z.object({
      comorbidities: z.array(z.string()),
      specialConditions: z.array(z.string())
    });

    // Prompt for risk groups
    const riskGroupsPrompt = `
    Dada a doença "${name}", retorne um JSON contendo dois arrays:
    - "comorbidities": IDs das comorbidades que devem ser consideradas grupos de risco.
    - "specialConditions": IDs das condições especiais que devem ser consideradas grupos de risco.
    
    Utilize apenas os registros disponíveis abaixo:
    
    Comorbidades:
    ${JSON.stringify(availableComorbiditiesList, null, 2)}
    
    Condições especiais:
    ${JSON.stringify(availableSpecialConditionsList, null, 2)}
    
    Retorne o JSON no formato:
    { "comorbidities": ["id1", "id2", ...], "specialConditions": ["id3", "id4", ...] }
  `;
    const riskGroupsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: riskGroupsPrompt },
        { role: 'user', content: name }
      ],
      response_format: zodResponseFormat(RiskGroupsSchema, 'riskGroupsSchema')
    });
    const riskGroupsData = riskGroupsCompletion.choices[0].message.parsed;
    if (!riskGroupsData) {
      return response.status(404).json({ error: "Erro ao gerar os dados iniciais dos grupos de risco" });
    }
    console.log("Dados dos Grupos de Risco:", riskGroupsData);

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
      const riskGroups = new RiskGroups();
      riskGroups.comorbidities = availableComorbidities.filter(c =>
        riskGroupsData.comorbidities.includes(c.id)
      );
      riskGroups.specialConditions = availableSpecialConditions.filter(s =>
        riskGroupsData.specialConditions.includes(s.id)
      );
      const savedRiskGroup = await RiskGroupRepository.save(riskGroups);
      disease.riskGroups = savedRiskGroup;

      // Map symptoms, alarm signs, and shock signs
      disease.symptoms = availableSymptoms.filter(s => symptomIds.includes(s.id));
      disease.alarmSigns = availableSymptoms.filter(s => alarmSignIds.includes(s.id));
      disease.shockSigns = availableSymptoms.filter(s => shockSignIds.includes(s.id));

      // Map key symptoms with weights
      const diseaseKeySymptoms = keySymptoms.map((keySymptom: any) => {
        const symptom = new DiseaseKeySymptom();
        symptom.weight = keySymptom.weight;
        symptom.symptomId = keySymptom.id;
        symptom.diseaseId = disease.id;
        return symptom;
      });
      disease.diseaseKeySymptoms = diseaseKeySymptoms;

      // Health protocols
      if (Array.isArray(diseaseData.healthProtocols)) {
        disease.healthProtocols = diseaseData.healthProtocols.map((protocol: any) => {
          const hp = new HealthProtocol();
          hp.severity = protocol.severity;
          hp.instructions = protocol.instructions;
          return hp;
        });
      }

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