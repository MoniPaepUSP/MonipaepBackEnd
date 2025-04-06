import { Request, Response } from "express";
import { Disease, HealthProtocol, RiskGroups } from "../models";
import { ComorbidityRepository, DiseaseRepository, RiskGroupRepository, SpecialConditionRepository, SymptomRepository } from "../repositories";
import { openai } from "src/openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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
    const { page } = request.query

    let options: any = {
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

    // Schema para os dados iniciais da doença
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

    // Prompt aprimorado para gerar os dados iniciais da doença
    const diseasePrompt = `
      Dada a doença "${name}", retorne um JSON com os seguintes dados:
      {
        "name": "<nome da doença>",
        "infectedMonitoringDays": <número de dias de monitoramento para paciente infectado>,
        "suspectedMonitoringDays": <número de dias de monitoramento para paciente com suspeita>,
        "healthProtocols": [
          {
            "severity": "<leve | moderado | grave | muito grave>",
            "instructions": "<instruções detalhadas para o protocolo de saúde>"
          },
          ...
        ]
      }
      Atenção: utilize valores realistas para os números e protocolos baseados em casos clínicos.
    `;

    // Chamada para gerar os dados iniciais da doença
    const diseaseCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: diseasePrompt },
        { role: 'user', content: name }
      ],
      temperature: 0,
      response_format: zodResponseFormat(DiseaseInitialSchema, 'diseaseInitialSchema')
    });

    const diseaseData = diseaseCompletion.choices[0].message.parsed;
    if (!diseaseData) {
      return response.status(404).json({ error: "Erro ao gerar os dados iniciais da doença" });
    }

    console.log(diseaseData);

    // Mapeando para um array com os atributos que interessam para o modelo: id e name
    const availableSymptoms = await SymptomRepository.find();
    const availableSymptomsList = availableSymptoms.map(symptom => ({
      id: symptom.id,
      name: symptom.name
    }));

    // Schema para a resposta do modelo (apenas os IDs dos sintomas)
    const SymptomsSchema = z.object({
      symptomIds: z.array(z.string())
    });
    const symptomPrompt = `
      Dada a doença "${name}", retorne um array JSON no seguinte formato:
      {
        "symptomIds": ["id1", "id2", ...]
      }
      
      Selecione apenas os IDs dos sintomas que devem ser incluídos no tratamento, considerando apenas os sintomas listados abaixo. 
      Utilize somente os IDs válidos que constam neste array:
      
      ${JSON.stringify(availableSymptomsList, null, 2)}
      
      Atenção: retorne apenas os IDs dos sintomas (apenas strings) que se aplicam à doença, sem informações adicionais.
    `;
    const symptomCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: symptomPrompt },
        { role: 'user', content: name }
      ],
      temperature: 0,
      response_format: zodResponseFormat(SymptomsSchema, 'symptomsSchema')
    });
    const symptomsData = symptomCompletion.choices[0].message.parsed;
    const symptomIds = symptomsData?.symptomIds ?? [];
    if (!symptomIds.length) {
      return response.status(404).json({ error: "Erro ao gerar os sintomas" });
    }

    console.log(symptomIds)

    // Schema e prompt para sinais de alarme
    const AlarmSignsSchema = z.object({
      alarmSignIds: z.array(z.string())
    });
    const alarmSignsPrompt = `
      Dada a doença "${name}", retorne um array JSON no seguinte formato:
      {
        "alarmSignIds": ["id1", "id2", ...]
      }
      
      Selecione os IDs dos sintomas que podem ser considerados sinais de alarme da doença,
      considerando apenas os sintomas listados abaixo. Utilize somente os IDs válidos que constam neste array:
      
      ${JSON.stringify(availableSymptomsList, null, 2)}
      
      Atenção: retorne apenas os IDs dos sintomas (apenas strings) que se aplicam à doença, sem informações adicionais.
    `;
    const alarmSignsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: alarmSignsPrompt },
        { role: 'user', content: name }
      ],
      temperature: 0,
      response_format: zodResponseFormat(AlarmSignsSchema, 'alarmSignsSchema')
    });
    const alarmSignIds = alarmSignsCompletion.choices[0].message.parsed?.alarmSignIds ?? [];
    if (!alarmSignIds.length) {
      return response.status(404).json({ error: "Erro ao gerar os sinais de alarme" });
    }

    console.log(alarmSignIds);

    // Schema e prompt para sinais de choque
    const ShockSignsSchema = z.object({
      shockSignIds: z.array(z.string())
    });
    const shockSignsPrompt = `
      Dada a doença "${name}", retorne um array JSON no seguinte formato: 
      {
        "shockSignIds": ["id1", "id2", ...]
      }
      
      Selecione os IDs dos sintomas que podem ser considerados sinais de choque,
      considerando apenas os sintomas listados abaixo. Utilize somente os IDs válidos que constam neste array:
      
      ${JSON.stringify(availableSymptomsList, null, 2)}
      
      Atenção: retorne apenas os IDs dos sintomas (apenas strings) que se aplicam à doença, sem informações adicionais.
    `;
    const shockSignsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: shockSignsPrompt },
        { role: 'user', content: name }
      ],
      temperature: 0,
      response_format: zodResponseFormat(ShockSignsSchema, 'shockSignsSchema')
    });
    const shockSignsData = shockSignsCompletion.choices[0].message.parsed;
    const shockSignIds = shockSignsData?.shockSignIds ?? [];
    if (!shockSignIds.length) {
      return response.status(404).json({ error: "Erro ao gerar os sintomas" });
    }

    console.log(shockSignIds);

    // Mapeando para um array com os atributos que interessam para o modelo: id e name
    const availableComorbidities = await ComorbidityRepository.find();
    const availableComorbiditiesList = availableComorbidities.map(comorbidity => ({
      id: comorbidity.id,
      name: comorbidity.name
    }));
    const availableSpecialConditions = await SpecialConditionRepository.find();
    const availableSpecialConditionsList = availableSpecialConditions.map(specialCondition => ({
      id: specialCondition.id,
      name: specialCondition.name
    }));

    // Schema e prompt para grupos de risco: comorbidades e condições especiais
    const RiskGroupsSchema = z.object({
      comorbidities: z.array(z.string()),
      specialConditions: z.array(z.string())
    });
    const riskGroupsPrompt = `
      Dada a doença "${name}", retorne um JSON contendo dois arrays:
      - "comorbidities": IDs das comorbidades disponíveis que devem ser consideradas como grupos de risco para esta doença.
      - "specialConditions": IDs das condições especiais disponíveis que devem ser consideradas como grupos de risco para esta doença.
      
      Utilize apenas os registros disponíveis abaixo e retorne somente os IDs válidos.
      
      Comorbidades disponíveis:
      ${JSON.stringify(availableComorbiditiesList, null, 2)}
      
      Condições especiais disponíveis:
      ${JSON.stringify(availableSpecialConditionsList, null, 2)}
      
      Formato esperado: { "comorbidities": ["id1", "id2", ...], "specialConditions": ["id3", "id4", ...] }
    `;
    const riskGroupsCompletion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: riskGroupsPrompt },
        { role: 'user', content: name }
      ],
      temperature: 0,
      response_format: zodResponseFormat(RiskGroupsSchema, 'riskGroupsSchema')
    });
    const riskGroupsData = riskGroupsCompletion.choices[0].message.parsed;
    if (!riskGroupsData) {
      return response.status(404).json({ error: "Erro ao retornar os grupos de risco" });
    }

    console.log(riskGroupsData);

    try {
      // Cria instância da doença
      const disease = new Disease();
      disease.name = name;
      disease.infectedMonitoringDays = diseaseData.infectedMonitoringDays;
      disease.suspectedMonitoringDays = diseaseData.suspectedMonitoringDays;

      // Cria e associa grupos de risco
      const riskGroups = new RiskGroups();
      riskGroups.comorbidities = availableComorbidities.filter((comorbidity) => riskGroupsData.comorbidities.includes(comorbidity.id));
      riskGroups.specialConditions = availableSpecialConditions.filter((specialCondition) => riskGroupsData.specialConditions.includes(specialCondition.id));
      const savedRiskGroup = await RiskGroupRepository.save(riskGroups);
      disease.riskGroups = savedRiskGroup;

      disease.symptoms = availableSymptoms.filter((symptom) => symptomIds.includes(symptom.id));
      disease.alarmSigns = availableSymptoms.filter((symptom) => alarmSignIds.includes(symptom.id));
      disease.shockSigns = availableSymptoms.filter((symptom) => shockSignIds.includes(symptom.id));

      // Protocolos de saúde
      if (Array.isArray(diseaseData.healthProtocols)) {
        disease.healthProtocols = diseaseData.healthProtocols.map((protocol: any) => {
          const hp = new HealthProtocol();
          hp.severity = protocol.severity;
          hp.instructions = protocol.instructions;
          return hp;
        });
      }

      // Salva a doença com todos os relacionamentos
      const createdDisease = await DiseaseRepository.save(disease);
      return response.status(201).json(createdDisease);
    } catch (error) {
      console.error("Erro ao criar doença a partir dos dados do GPT:", error);
      return response.status(500).json({ error: `Erro ao criar doença a partir dos dados gerados: ${error}` });
    }
  }
}

export { DiseaseController }