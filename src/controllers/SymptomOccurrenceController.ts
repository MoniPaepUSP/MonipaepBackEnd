import { Request, Response } from "express";
import { In, IsNull, Like } from "typeorm";

import { SymptomOccurrence } from "../models";
import {
  DiseaseOccurrenceRepository,
  PatientsRepository,
  SymptomOccurrenceRepository,
} from "../repositories";

class SymptomOccurrenceController {

  async create(request: Request, response: Response) {
    try {
      const { patient_id, symptoms, remarks } = request.body;

      // Validate patient existence.
      const patient = await PatientsRepository.findOne({ where: { id: patient_id } });
      if (!patient) {
        return response.status(404).json({ error: "Paciente não encontrado" });
      }

      // Validate that at least one symptom is provided.
      if (!Array.isArray(symptoms) || symptoms.length === 0) {
        return response.status(400).json({ error: "Selecione pelo menos um sintoma" });
      }

      // Find ongoing disease occurrences.
      const ongoingDiseaseOccurrences = await DiseaseOccurrenceRepository.find({
        where: {
          patientId: patient_id,
          status: In(["Suspeito", "Infectado"]),
        },
      });

      const registeredDate = new Date();
      const symptomsText = symptoms.join(", ");

      // Build occurrence(s) based on existing disease occurrences.
      const occurrencesToCreate: Partial<SymptomOccurrence>[] = ongoingDiseaseOccurrences.length === 0
        ? [{
          patientId: patient_id,
          diseaseOccurrenceId: undefined,
          registeredDate,
          symptoms: symptomsText,
          remarks,
        }]
        : ongoingDiseaseOccurrences.map(diseaseOccurrence => ({
          patientId: patient_id,
          diseaseOccurrenceId: diseaseOccurrence.id,
          registeredDate,
          symptoms: symptomsText,
          remarks,
        }));

      const createdOccurrences = SymptomOccurrenceRepository.create(occurrencesToCreate);
      await SymptomOccurrenceRepository.save(createdOccurrences);

      return response.status(201).json({ success: "Sintoma registrado com sucesso" });
    } catch (error) {
      console.error("Error creating symptom occurrence:", error);
      return response.status(500).json({ error: "Erro no cadastro do sintoma" });
    }
  }

  async getUnassignedOccurrences(request: Request, response: Response) {
    try {
      const { page, patient_name } = request.query;
      const take = 10;
      const skip = page ? (Number(page) - 1) * take : 0;

      // Build query conditions for unassigned occurrences.
      const query = SymptomOccurrenceRepository.createQueryBuilder("occurrence")
        .leftJoinAndSelect("occurrence.patient", "patient")
        .where("occurrence.diseaseOccurrence IS NULL");

      if (patient_name) {
        query.andWhere("patient.name LIKE :name", { name: `%${patient_name}%` });
      }

      query.orderBy("occurrence.registeredDate", "DESC")
        .skip(skip)
        .take(take);

      const [items, totalCount] = await query.getManyAndCount();

      const formattedData = items.map(occurrence => ({
        id: occurrence.id,
        patient_id: occurrence.patient.id,
        registered_date: occurrence.registeredDate,
        patient: {
          name: occurrence.patient.name,
          email: occurrence.patient.email,
        },
        symptoms: occurrence.symptoms ? occurrence.symptoms.split(",").map(s => s.trim()) : [],
        remarks: occurrence.remarks,
      }));

      return response.status(200).json({
        symptomOccurrences: formattedData,
        totalSymptomOccurrences: totalCount,
      });
    } catch (error) {
      console.error("Erro ao buscar ocorrências não atribuídas:", error);
      return response.status(500).json({ error: "Erro na listagem das ocorrências de sintomas" });
    }
  }

  async list(request: Request, response: Response) {
    try {

      const { id, patient_id, symptom_name, disease_occurrence_id, unassigned } = request.query;
      let filters: any = {};

      if (id) {
        const occurrence = await SymptomOccurrenceRepository.findOne({ where: { id: String(id) } });
        if (!occurrence) {
          return response.status(404).json({ error: "Ocorrência de sintoma não encontrada" });
        }
        filters.id = String(id);
      }

      if (patient_id) {
        const patient = await PatientsRepository.findOne({ where: { id: String(patient_id) } });
        if (!patient) {
          return response.status(404).json({ error: "Paciente não encontrado" });
        }
        filters.patientId = String(patient_id);
      }

      if (symptom_name) {
        filters.symptoms = Like(`%${String(symptom_name)}%`);
      }

      if (disease_occurrence_id) {
        const diseaseOccurrence = await DiseaseOccurrenceRepository.findOne({ where: { id: String(disease_occurrence_id) } });
        if (!diseaseOccurrence) {
          return response.status(404).json({ error: "Ocorrência de doença não encontrada" });
        }
        filters.diseaseOccurrenceId = String(disease_occurrence_id);
      }

      if (unassigned) {
        filters.diseaseOccurrenceId = IsNull();
      }

      const occurrencesList = await SymptomOccurrenceRepository.find({
        where: filters,
        order: { registeredDate: "DESC" },
      });

      const formattedData = occurrencesList.map(occurrence => ({
        ...occurrence,
        symptoms: occurrence.symptoms ? occurrence.symptoms.split(",").map(s => s.trim()) : [],
      }));

      return response.status(200).json({
        symptomOccurrences: formattedData,
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
      const occurrence = await SymptomOccurrenceRepository.findOne({ where: { id } });
      if (!occurrence) {
        return response.status(404).json({ error: "Ocorrência de sintoma inválida" });
      }

      const formattedData = {
        ...occurrence,
        symptoms: occurrence.symptoms ? occurrence.symptoms.split(",").map(s => s.trim()) : [],
        remarks: occurrence.remarks,
      };

      return response.status(200).json(formattedData);
    } catch (error) {
      console.error("Erro ao buscar ocorrência:", error);
      return response.status(500).json({ error: "Erro ao buscar ocorrência de sintoma" });
    }
  }
}

export { SymptomOccurrenceController };
