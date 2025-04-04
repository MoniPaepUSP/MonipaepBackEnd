import { Response } from "express";
import { ChatMessage, Patient } from "../models";
import {
  PatientsRepository,
  SymptomOccurrenceRepository,
  ChatMessageRepository,
} from "../repositories";
import { openai } from "src/openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { DENGUE } from "src/lib/dengueRules";
import { ChatCompletionMessageParam } from "openai/resources";

const FurtherEvaluationSchema = z.object({
  hasAlarmSigns: z.boolean(),
  hasShockSigns: z.boolean(),
  hasBleeding: z.boolean(),
});

const EvalueSchema = z.object({
  concluded: z.boolean(),
  message: z.string().optional(),
  isSuspected: z.boolean().optional(),
  symptoms: z.array(z.string()).optional(),
  remarks: z.string().optional(),
});

interface Evaluation {
  concluded: boolean;
  message?: string;
  isSuspected?: boolean;
  symptoms?: string[];
  remarks?: string;
}

class OpenAiController {
  async chat(request: any, response: Response) {
    const { id } = request.tokenPayload;

    // Fetch the patient
    const patient: Patient | null = await PatientsRepository.findOne({ where: { id } });
    if (!patient) {
      return response.status(404).json({ error: 'Paciente não encontrado' });
    }

    // The message sent by the user
    let { text, symptomOccurrenceId }: {
      text: string;
      symptomOccurrenceId?: string;
    } = request.body;
    console.log(request.body);

    if (!symptomOccurrenceId) {
      // Assign the new conversation ID
      symptomOccurrenceId = await createSymptomOccurrence(id);
      await createChatMessage(symptomOccurrenceId, "user", text);
    } else {
      // Save the message to the chat history
      await saveChatMessage(symptomOccurrenceId, "user", text);
    }

    try {
      const evaluation: Evaluation = await evalueDengueCase(patient.name, patient.birthdate, symptomOccurrenceId);
      if (!evaluation.concluded) {
        if (!evaluation.message) {
          throw new Error('Erro ao avaliar caso de dengue');
        }
        const chatMessage = await saveChatMessage(symptomOccurrenceId, "assistant", evaluation.message);
        return response.status(200).json({ chatMessage });
      }

      const { isSuspected, symptoms, remarks } = evaluation;
      console.log("Suspeito: ", isSuspected, ", Sintomas: ", symptoms, ", Observações:", remarks);
      await updateSymptomOccurrence(symptomOccurrenceId, symptoms!, remarks!);

      const furtherEval = await furtherEvaluation(isSuspected!, [], [], symptoms!, remarks);
      console.log(furtherEval);

      const chatMessage = await saveChatMessage(symptomOccurrenceId, "assistant", furtherEval);
      return response.status(200).json({ chatMessage });

    } catch (error: any) {
      return response.status(500).json({
        error: "Erro no servidor: " + error
      })
    }
  }
}

async function createChatMessage(symptomOccurrenceId: string, role: "user" | "assistant", message: string): Promise<ChatMessage> {
  const chatMessage = ChatMessageRepository.create({
    symptomOccurrenceId,
    role,
    message,
  });
  return await ChatMessageRepository.save(chatMessage);
}

async function saveChatMessage(symptomOccurrenceId: string, role: "user" | "assistant", message: string): Promise<ChatMessage> {
  const chatMessage = ChatMessageRepository.create({
    symptomOccurrenceId,
    role,
    message,
  });
  return await ChatMessageRepository.save(chatMessage);
}

async function createSymptomOccurrence(patientId: string): Promise<string> {
  const symptomOccurrence = SymptomOccurrenceRepository.create({
    patientId,
    registeredDate: new Date(),
  });
  await SymptomOccurrenceRepository.save(symptomOccurrence);
  return symptomOccurrence.id;
}

async function updateSymptomOccurrence(occurrenceId: string, symptoms: string[], remarks: string): Promise<void> {
  await SymptomOccurrenceRepository.update(occurrenceId, {
    symptoms: symptoms.join(', '),
    remarks,
  });
}

async function furtherEvaluation(
  isSuspected: boolean,
  comorbidities: string[],
  riskGroups: string[],
  symptoms: string[],
  remarks?: string): Promise<string> {

  if (!isSuspected)
    return 'Você não é um caso suspeito de dengue.';

  const systemContent = `Analise APENAS fatos presentes:
    Sinais de alarme (${DENGUE.ALARM_SIGNS}): SIM/NÃO
    Sinais de choque (${DENGUE.SHOCK_SIGNS}): SIM/NÃO
    Sangramento: SIM/NÃO

    Responda APENAS com o formato JSON especificado`;

  // Sistema de regras para identificar grupo do paciente
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: `Sintomas: ${symptoms.join(', ')}; Observações: ${remarks}` },
    ],
    temperature: 0.1,
    response_format: zodResponseFormat(FurtherEvaluationSchema, 'furtherEvaluation'),
  })

  const furtherEvaluation = completion.choices[0].message.parsed;
  if (!furtherEvaluation) {
    throw new Error('Erro ao avaliar caso de dengue');
  }

  console.log(furtherEvaluation);

  const hasComorbidities = comorbidities.length > 0;
  const isRiskGroup = riskGroups.length > 0;
  const hasAlarmSigns = furtherEvaluation.hasAlarmSigns;
  const hasShockSigns = furtherEvaluation.hasShockSigns;
  const hasBleeding = furtherEvaluation.hasBleeding;

  if (hasShockSigns) {
    return 'D';
  }

  if (hasAlarmSigns) {
    return 'C';
  }

  if (hasBleeding || hasComorbidities || isRiskGroup) {
    return 'B';
  }

  return 'A';
}

// Função para avaliar caso de dengue
// Os sintomas já foram extraídos anteriormente, e guardados no banco de dados
async function evalueDengueCase(
  name: string,
  birthdate: Date,
  symptomOccurrenceId: string,
) {
  const systemPrompt = `**Você é um classificador médico objetivo para dengue, que conversa diretamente com o paciente**  
Seu objetivo é analisar os fatos clinicamente relevantes a partir da conversa com o paciente e classificar o caso com base nos critérios da OMS para dengue.  

### **Critérios de Classificação da OMS para Dengue:**  
1. **Caso suspeito de dengue:**  
   - Febre (duração de 2 a 7 dias) **E** pelo menos **2** dos seguintes sintomas:  
     - Náuseas/vômitos  
     - Exantema  
     - Mialgia  
     - Artralgia  
     - Cefaleia  
     - Dor retroorbital  
2. **Crianças em área endêmica:**  
   - Febre sem foco aparente pode ser suficiente para suspeita clínica.  

### **Instruções de resposta:**  
1. **Se for possível concluir a classificação:**  
   - Retorne um objeto JSON com:  
     \`\`\`json
     {
       "concluded": true,
       "isSuspected": (true ou false),
       "symptoms": ["sintoma1", "sintoma2", ...],
       "remarks": "Observações relevantes sobre duração, intensidade ou frequência dos sintomas."
     }
     \`\`\`
2. **Se não for possível concluir:**  
   - Retorne um objeto JSON solicitando mais informações:  
     \`\`\`json
     {
       "concluded": false,
       "message": "Pergunta objetiva solicitando uma informação específica."
     }
     \`\`\`
3. **Importante:**  
   - **Faça apenas uma pergunta por vez** quando precisar de mais informações.  
   - **Não inclua explicações, conselhos ou interpretações adicionais.**  
`;

  // Not using symptom history for now

  // Fetch the conversation history
  const conversationHistory: ChatMessage[] = await ChatMessageRepository.find({
    where: { symptomOccurrenceId },
  });

  // Format the conversation history
  const symptomsHistoryFormatted: ChatCompletionMessageParam[] = conversationHistory.map((chat) => ({
    role: chat.role as "user" | "assistant",
    content: chat.message,
  }));
  const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

  // Call the OpenAI API
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Nome do paciente: ${name}, Idade: ${age}` },
      ...symptomsHistoryFormatted,
    ],
    temperature: 0.1,
    response_format: zodResponseFormat(EvalueSchema, 'evalueDengueCase'),
  });

  // Parse the response
  const evalue = completion.choices[0].message.parsed;
  if (!evalue) {
    throw new Error('Erro ao avaliar caso de dengue');
  }

  // If the evaluation is not concluded, return the message
  if (!evalue.concluded) {
    return {
      concluded: false,
      message: evalue.message,
    };
  } else {
    return {
      concluded: true,
      isSuspected: evalue.isSuspected,
      symptoms: evalue.symptoms,
      remarks: evalue.remarks,
    }
  }
}

export { OpenAiController };