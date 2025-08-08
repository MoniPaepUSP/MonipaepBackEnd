import { Request, Response } from "express";
import { In, IsNull, Like } from "typeorm";

import { HealthProtocol, Patient, SymptomOccurrence } from "../models";
import {
  DiseaseOccurrenceRepository,
  DiseaseRepository,
  HealthProtocolRepository,
  PatientsRepository,
  SymptomOccurrenceRepository,
} from "../repositories";
import { openai } from "../openai";

class SymptomOccurrenceController {

  async create(request: any, response: Response) {
    try {
      const { id, type } = request.tokenPayload

      if (type !== 'patient') {
        return response.status(401).json({
          error: "Token inválido para essa requisição"
        })
      }

      const { symptoms, remarks } = request.body;

      // Validate patient existence.
      const patient = await PatientsRepository.findOne({ where: { id } });
      if (!patient) {
        return response.status(404).json({ error: "Paciente não encontrado" });
      }

      // Validate that at least one symptom is provided.
      if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return response.status(400).json({ error: "Selecione pelo menos um sintoma" });
      }

      // Find ongoing disease occurrences.
      const ongoingDiseaseOccurrence = await DiseaseOccurrenceRepository.findOne({
        where: {
          patientId: id,
          status: In(["Suspeito", "Infectado"]),
        },
        order: { dateStart: "DESC" },
      });

      const registeredDate = new Date();

      const newSymptomOccurrence = SymptomOccurrenceRepository.create({
        patientId: id,
        registeredDate,
        symptoms,
        remarks: remarks.trim() || null,
        chat: false,
        probableDiseases: [],
        diseaseOccurrenceId: ongoingDiseaseOccurrence ? ongoingDiseaseOccurrence.id : null,
        isPatientInRiskGroup: false, // Default value, can be updated later
      })
      const symptomOccurrence = await SymptomOccurrenceRepository.save(newSymptomOccurrence);

      return response.status(201).json({ success: "Ocorrência de sintomas registrado com sucesso", symptomOccurrence });
    } catch (error) {
      console.error("Error creating symptom occurrence:", error);
      return response.status(500).json({ error: "Erro no cadastro do sintoma" });
    }
  }

  async list(request: Request, response: Response) {
    try {
      const { id, patientId, symptom_name, disease_occurrence_id, unassigned } = request.query;
      let filters: any = {};

      if (id) {
        const occurrence = await SymptomOccurrenceRepository.findOne({
          where: { id: String(id) },
        });
        if (!occurrence) {
          return response.status(404).json({ error: "Ocorrência de sintoma não encontrada" });
        }
        filters.id = String(id);
      }

      if (patientId) {
        const patient = await PatientsRepository.findOne({
          where: { id: String(patientId) },
        });
        if (!patient) {
          return response.status(404).json({ error: "Paciente não encontrado" });
        }
        filters.patientId = String(patientId);
      }

      if (symptom_name) {
        filters.symptoms = Like(`%${String(symptom_name)}%`);
      }

      if (disease_occurrence_id) {
        const diseaseOccurrence = await DiseaseOccurrenceRepository.findOne({
          where: { id: String(disease_occurrence_id) },
        });
        if (!diseaseOccurrence) {
          return response.status(404).json({ error: "Ocorrência de doença não encontrada" });
        }
        filters.diseaseOccurrenceId = String(disease_occurrence_id);
      }

      if (unassigned) {
        filters.diseaseOccurrenceId = IsNull();
      }

      const symptomOccurrences = await SymptomOccurrenceRepository.find({
        where: filters,
        order: { registeredDate: "DESC" },
        relations: {
          symptoms: true,
          patient: true,
        }
      });

      return response.status(200).json({
        symptomOccurrences,
        totalSymptomOccurrences: symptomOccurrences.length,
      });
    } catch (error) {
      console.error("Erro ao listar ocorrências:", error);
      return response.status(500).json({ error: "Erro na listagem de ocorrências de sintomas" });
    }
  }

  async alterOne(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const updateData = { ...request.body };

      const occurrence = await SymptomOccurrenceRepository.findOne({ where: { id } });
      if (!occurrence) {
        return response.status(404).json({ error: "Ocorrência de sintoma inválida" });
      }

      if (updateData.symptoms && Array.isArray(updateData.symptoms)) {
        updateData.symptoms = updateData.symptoms.join(", ");
      }

      if (updateData.remarks && typeof updateData.remarks !== "string") {
        updateData.remarks = null;
      }

      await SymptomOccurrenceRepository.update(id, updateData);
      return response.status(200).json({ success: "Ocorrência de sintoma atualizada com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      return response.status(500).json({ error: "Erro na atualização do sintoma" });
    }
  }

  async deleteOne(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const occurrence = await SymptomOccurrenceRepository.findOne({ where: { id } });
      if (!occurrence) {
        return response.status(404).json({ error: "Ocorrência de sintoma inválida" });
      }

      await SymptomOccurrenceRepository.delete(id);
      return response.status(200).json({ success: "Ocorrência de sintoma deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ocorrência:", error);
      return response.status(500).json({ error: "Erro na deleção do sintoma" });
    }
  }

  async findOne(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const occurrence = await SymptomOccurrenceRepository.findOne({
        where: { id },
        relations: {
          symptoms: true
        }
      });
      if (!occurrence) {
        return response.status(404).json({ error: "Ocorrência de sintoma inválida" });
      }

      return response.status(200).json(occurrence);
    } catch (error) {
      console.error("Erro ao buscar ocorrência:", error);
      return response.status(500).json({ error: "Erro ao buscar ocorrência de sintoma" });
    }
  }

  // This method is used to analyze the symptoms and provide health protocols based on the occurrence.
  // 1. It gets the possible diseases based on the symptoms (at least 3 symptoms must match).
  // 2. It retrieves health protocols for those diseases, ordered by gravity level.
  // 3. It checks if the patient is in a risk group for those diseases.
  // 4. It returns the health protocols with the risk group status.
  async analysis(request: any, response: Response) {
    try {
      const { id: patientId } = request.tokenPayload
      const patient = await PatientsRepository.findOne({
        where: { id: patientId },
        relations: {
          comorbidities: true,
          specialConditions: true
        }
      });
      if (!patient) {
        return response.status(404).json({ error: "Paciente não encontrado" });
      }

      // cache the patient’s risk-group IDs
      const patientComIds = patient.comorbidities.map(c => c.id);
      const patientSpecIds = patient.specialConditions.map(s => s.id);

      // Get the symptom occurrence by ID
      const { id } = request.params;
      const occurrence = await SymptomOccurrenceRepository.findOne({
        where: { id },
        relations: {
          symptoms: true
        }
      });
      if (!occurrence) {
        return response.status(404).json({ error: "Ocorrência de sintoma inválida" });
      }
      const symptomIds = occurrence.symptoms.map(s => s.id);

      // Identify diseases that match at least 3 of the reported symptoms
      const possibleDiseases = await DiseaseRepository.createQueryBuilder("d")
        .innerJoin("d.symptoms", "symptom", "symptom.id IN (:...ids)", { ids: symptomIds })
        .select("d.id", "id")
        .addSelect("COUNT(symptom.id)", "matchedSymptoms")
        .groupBy("d.id")
        .having("COUNT(symptom.id) >= :minSymptoms", { minSymptoms: 3 })
        .getRawMany();

      // To get the healthprotocols with matching symptoms and gravity levels
      const healthProtocols = await HealthProtocolRepository.createQueryBuilder("hp")
        .innerJoin("hp.symptoms", "symptom", "symptom.id IN (:...ids)", { ids: symptomIds })
        .groupBy("hp.id")
        .addOrderBy("hp.gravityLevel", "DESC")
        .getMany();

      // Pick the top protocol per disease (by gravity level)
      const topByDisease = new Map<string, HealthProtocol>();
      for (const hp of healthProtocols) {
        if (!possibleDiseases.some(d => d.id === hp.diseaseId)) {
          continue; // skip protocols for diseases not in the possibleDiseaseIds
        }

        const existing = topByDisease.get(hp.diseaseId);
        if (!existing
          || hp.gravityLevel > existing.gravityLevel
        ) {
          topByDisease.set(hp.diseaseId, hp);
        }
      }

      const result = Array.from(topByDisease.values());

      // fetch all the diseases for those protocols, with their risk groups
      const diseaseIds = result.map(hp => hp.diseaseId);
      const diseases = await DiseaseRepository.find({
        where: { id: In(diseaseIds) },
        relations: ["comorbidities", "specialConditions"]
      });

      // build a map: diseaseId → boolean (isPatientInRiskGroup)
      const comorbiditiesMap = new Map<string, string[]>();
      const specialConditionsMap = new Map<string, string[]>();
      for (const disease of diseases) {
        const matchedComorbidities = disease.comorbidities.filter(c => patientComIds.includes(c.id)).map(c => c.name);
        const matchedSpecialConditions = disease.specialConditions.filter(s => patientSpecIds.includes(s.id)).map(s => s.name);
        comorbiditiesMap.set(disease.id, matchedComorbidities);
        specialConditionsMap.set(disease.id, matchedSpecialConditions);
      }

      // Attach `patientAtRisk` to each protocol
      const output = result.map(hp => ({
        healthProtocolId: hp.id,
        diseaseName: diseases.find(d => d.id === hp.diseaseId)?.name || "Desconhecido",
        diseaseId: hp.diseaseId,
        gravityLevel: hp.gravityLevel,
        gravityLabel: hp.gravityLabel,
        instructions: hp.instructions,
        referUSM: hp.referUSM,
        comorbiditiesMatched: comorbiditiesMap.get(hp.diseaseId) || [],
        specialConditionsMatched: specialConditionsMap.get(hp.diseaseId) || [],
      }));

      return response.status(200).json({ output });
    } catch (error) {
      console.error("Erro ao gerar análise:", error);
      return response.status(500).json({ error: "Erro ao gerar análise" });
    }
  }

  async protocol(request: any, response: Response) {
    const { id: patientId } = request.tokenPayload;
    const { id } = request.params;
    const {
      data,
    }: {
      data: {
        healthProtocolId: string;
        comorbiditiesMatched: string[];
        specialConditionsMatched: string[];
      }[];
    } = request.body;

    console.log("Received protocol request:", { patientId, occurrenceId: id, data });

    // Buscar o paciente
    const patient: Patient | null = await PatientsRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      return response.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Buscar a ocorrência de sintomas
    const symptomOccurrence = await SymptomOccurrenceRepository.findOne({
      where: { id, patientId },
      relations: ["symptoms"]
    });
    if (!symptomOccurrence) {
      return response.status(403).json({ error: "Ocorrência de sintoma não encontrada" });
    }

    // Buscar os protocolos de saúde aplicáveis e guardar as informações
    const healthProtocols: HealthProtocol[] = [];
    for (const protocol of data) {
      const healthProtocol = await HealthProtocolRepository.findOne({
        where: { id: protocol.healthProtocolId },
        relations: ["disease"]
      });

      if (!healthProtocol) {
        return response.status(404).json({ error: `Protocolo de saúde com ID ${protocol.healthProtocolId} não encontrado` });
      }

      healthProtocols.push(healthProtocol);
    }

    try {
      // Monta o prompt de sistema com as instruções gerais e informações de apoio
      const systemPrompt = `
        Você é um assistente virtual de saúde. Sua tarefa é analisar os sintomas relatados por um paciente e os protocolos de saúde aplicáveis, e gerar uma mensagem clara, empática e objetiva com orientações baseadas nesses dados.

        Informações:
        - Nome do paciente: ${patient.name}
        - Sintomas relatados: ${symptomOccurrence.symptoms.map(s => s.name).join(", ")}

        Protocolos identificados:
        ${data.map((protocol, index) => {
        const hp = healthProtocols[index];
        return `
        [${index + 1}] Protocolo para: ${hp.disease.name}
          - Gravidade: ${hp.gravityLabel}
          - Instruções: ${hp.instructions}
          - Encaminhamento: ${hp.referUSM ? hp.referUSM : "Não necessário"}
          - Comorbidades de risco encontradas: ${protocol.comorbiditiesMatched.join(", ") || "Nenhuma"}
          - Condições especiais de risco encontradas: ${protocol.specialConditionsMatched.join(", ") || "Nenhuma"}`;
      }).join("\n")}

        Com base nessas informações, escreva uma mensagem final para o paciente que:

        1. Explique de forma clara e breve os próximos passos;
        2. Destaque se há sinais de gravidade;
        3. Resuma as instruções do(s) protocolo(s);
        4. Informe se é necessário ir a uma UPA/UBS;
        5. Seja amigável, acolhedor e profissional;
        6. Use uma linguagem acessível, sem termos médicos difíceis;
        7. Tenha no máximo 300 caracteres.
        `;


      // Geração da mensagem com responses
      const responses = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
        ],
        temperature: 0.1,
      });
      const text = responses.choices[0].message.content;

      return response.status(200).json({ text });
    } catch (error: any) {
      return response.status(500).json({ error: "Erro no servidor: " + error });
    }
  }
}

export { SymptomOccurrenceController };
