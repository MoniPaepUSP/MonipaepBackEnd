import { Response } from "express";
import { ChatMessage, Patient } from "../models";
import {
  PatientsRepository,
  SymptomOccurrenceRepository,
  ChatMessageRepository,
  SymptomRepository,
  DiseaseRepository,
} from "../repositories";
import { openai } from "src/openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { In } from "typeorm";

class ChatController {
  async analysis(request: any, response: Response) {
    const { id } = request.tokenPayload;
    const { symptomIds }: { symptomIds: string[] } = request.body;

    // 1) Buscar paciente com comorbidades e condições
    const patient = await PatientsRepository.findOne({
      where: { id },
      relations: ['comorbidities', 'specialConditions']
    });
    if (!patient) {
      return response.status(404).json({ error: 'Paciente não encontrado' });
    }

    const patientSymptoms = await SymptomRepository.find({
      order: {
        name: "ASC"
      },
      where: {
        id: In(symptomIds)
      }
    })

    // Get all the diseases and its data
    const diseases = await DiseaseRepository.find({
      order: {
        name: "ASC"
      },
      relations: {
        riskGroups: {
          comorbidities: true,
          specialConditions: true,
        },
        symptoms: true,
        alarmSigns: true,
        shockSigns: true,
        healthProtocols: true
      }
    });

    // 4) Scoring
    const probableDiseases = diseases
      .map(disease => {
        const symptomMatch = disease.symptoms.filter(s => symptomIds.includes(s.id));
        const alarmMatch = disease.alarmSigns.filter(s => symptomIds.includes(s.id));
        const shockMatch = disease.shockSigns.filter(s => symptomIds.includes(s.id));
        const keyMatchScore = disease.diseaseKeySymptoms
          .filter(ks => symptomIds.includes(ks.symptom.id))
          .reduce((sum, ks) => sum + ks.weight * 4 /* keySymptomWeight */, 0);

        const inComorbidityGroup = disease.riskGroups?.comorbidities
          .some(c => patient.comorbidities.some(p => p.id === c.id)) ?? false;
        const inSpecialGroup = disease.riskGroups?.specialConditions
          .some(c => patient.specialConditions.some(p => p.id === c.id)) ?? false;
        const isRiskGroup = inComorbidityGroup || inSpecialGroup;

        // pesos básicos
        const symptomWeight = 1.5;
        const alarmSignWeight = 2;
        const shockSignWeight = 3;
        const keySymptomWeight = 4;

        // total possível agora inclui key-symptoms
        const totalPos =
          disease.symptoms.length * symptomWeight +
          disease.alarmSigns.length * alarmSignWeight +
          disease.shockSigns.length * shockSignWeight +
          disease.diseaseKeySymptoms.length * keySymptomWeight;

        // peso encontrado
        const matched =
          symptomMatch.length * symptomWeight +
          alarmMatch.length * alarmSignWeight +
          shockMatch.length * shockSignWeight +
          keyMatchScore;

        const baseScore = totalPos === 0 ? 0 : matched / totalPos;
        const riskBonus = isRiskGroup ? 0.1 : 0;
        const suspicionScore = Math.min(baseScore + riskBonus, 1);

        return {
          id: disease.id,
          name: disease.name,
          isPatientInRiskGroup: isRiskGroup,
          suspicionScore
        };
      })
      .filter(d => d.suspicionScore >= 0.3);

    // 5) Persistir ocorrência
    const occurrence = SymptomOccurrenceRepository.create({
      patientId: id,
      symptoms: patientSymptoms,
      chat: probableDiseases.length > 0,
      registeredDate: new Date(),
      probableDiseases
    });
    await SymptomOccurrenceRepository.save(occurrence);

    return response.status(200).json({ symptomOccurrence: occurrence });
  }

  async chat(request: any, response: Response) {
    const { id } = request.tokenPayload;

    // Buscar o paciente
    const patient: Patient | null = await PatientsRepository.findOne({ where: { id } });
    if (!patient) {
      return response.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Dados enviados na mensagem do usuário
    let { text, symptomOccurrenceId
    }: {
      text: string;
      symptomOccurrenceId: string;
    } = request.body;

    // Buscar a ocorrência de sintomas
    const symptomOccurrence = await SymptomOccurrenceRepository.findOne({
      where: { id: symptomOccurrenceId }
    });
    if (!symptomOccurrence) {
      return response.status(403).json({ error: "Ocorrência de sintoma não encontrada" });
    } else if (!symptomOccurrence.chat) {
      return response.status(403).json({ error: "Não existe chat dessa ocorrência" });
    }

    // Salvar mensagem do usuário
    await saveChatMessage(symptomOccurrenceId, "user", text);

    // Buscar histórico da conversa
    const conversationHistory: ChatMessage[] = await ChatMessageRepository.find({
      where: { symptomOccurrenceId },
    });
    const conversationHistoryFormatted = conversationHistory.map(chat => ({
      role: chat.role as "user" | "assistant",
      content: chat.message,
    }));

    try {
      /* 
         ======= Padrão Híbrido =======
         1. O prompt do "system" carrega instruções gerais, a lista de doenças prováveis e outras informações relevantes.
         2. A lista de mensagens traz o histórico real da conversa.
         Dessa forma, o modelo tem o contexto necessário em ambos os níveis.
      */

      // Schema para validação da avaliação inicial
      const EvaluationSchema = z.object({
        concluded: z.boolean(),
        message: z.string(),
      });

      // Monta o prompt de sistema com as instruções gerais e informações de apoio
      const systemPrompt = `
      Você é um assistente clínico especializado em triagem de doenças tropicais.
      Siga as diretrizes clínicas e seja empático ao conversar com o paciente.
      
      Lista de doenças prováveis (já avaliadas previamente):
      ${JSON.stringify(symptomOccurrence.probableDiseases, null, 2)}
      
      Utilize o histórico da conversa para formular perguntas claras e objetivas que ajudem a confirmar ou descartar hipóteses diagnósticas. Faça perguntas simples, com no máximo 2 perguntas.
      Ao final, retorne um JSON no seguinte formato:
      {
        "concluded": <true|false>,
        "message": "<mensagem para o paciente>"
      }
    `;

      // Stage 1: Geração inicial da mensagem utilizando o padrão híbrido
      const initialChatCompletion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Nome do paciente: ${patient.name}` },
          ...conversationHistoryFormatted,
        ],
        temperature: 0.1,
        response_format: zodResponseFormat(EvaluationSchema, 'initialEvaluation'),
      });
      const initialEvaluation = initialChatCompletion.choices[0].message.parsed;
      if (!initialEvaluation) {
        throw new Error('Erro ao avaliar a conversa inicial');
      }
      console.log("Stage 1 - Resposta inicial do chat:", initialEvaluation.message);

      // Stage 2: Revisão e ajuste da resposta inicial utilizando o mesmo padrão híbrido
      const systemPromptReview = `
      Você recebeu a seguinte resposta inicial para o chat:
      "${initialEvaluation.message}"
      
      Reavalie essa resposta considerando o contexto clínico, o histórico da conversa e a lista de doenças prováveis:
      ${JSON.stringify(symptomOccurrence.probableDiseases, null, 2)}
      
      Ajuste a mensagem para garantir clareza, objetividade e aderência às diretrizes clínicas.
      Certifique-se de que não contenha mais de 2 perguntas.
      Se a informação for suficiente para concluir o atendimento, defina "concluded" como true.
      Retorne um JSON no mesmo formato:
      {
        "concluded": <true|false>,
        "message": "<mensagem revisada para o paciente>"
      }
    `;
      const reviewChatCompletion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPromptReview },
          // Incluímos a resposta inicial para o modelo revisar
          { role: 'assistant', content: initialEvaluation.message },
          // Mantemos também parte do histórico se necessário
          ...conversationHistoryFormatted,
        ],
        temperature: 0.1,
        response_format: zodResponseFormat(EvaluationSchema, 'reviewEvaluation'),
      });
      const reviewedEvaluation = reviewChatCompletion.choices[0].message.parsed;
      if (!reviewedEvaluation) {
        throw new Error('Erro ao revisar a mensagem do chat');
      }
      console.log("Stage 2 - Mensagem do chat revisada:", reviewedEvaluation.message);

      // Salvar a mensagem final do assistente
      const chatMessage = await saveChatMessage(symptomOccurrenceId, "assistant", reviewedEvaluation.message);

      // Se o chat não estiver concluído, retorna apenas a mensagem para continuar a conversa
      if (!reviewedEvaluation.concluded) {
        return response.status(200).json({ chatMessage });
      }

      // Caso o chat esteja concluído, pode-se seguir para uma avaliação final se necessário...
      // (Aqui, o exemplo segue retornando a mensagem final)
      return response.status(200).json({ chatMessage });
    } catch (error: any) {
      return response.status(500).json({ error: "Erro no servidor: " + error });
    }
  }
}

async function saveChatMessage(symptomOccurrenceId: string, role: "user" | "assistant", message: string): Promise<ChatMessage> {
  const chatMessage = ChatMessageRepository.create({
    symptomOccurrenceId,
    role,
    message,
  });
  return await ChatMessageRepository.save(chatMessage);
}

export { ChatController };