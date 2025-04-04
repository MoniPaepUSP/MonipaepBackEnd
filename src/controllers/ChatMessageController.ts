import { Response } from 'express';
import { ChatMessage, Patient } from 'src/models';
import { ChatMessageRepository, PatientsRepository } from 'src/repositories';

class ChatMessageController {

  async getMessagesFromOccurrence(request: any, response: Response) {
    const { id } = request.tokenPayload;
    const { occurrence_id } = request.params; // Assuming the conversationId comes as a URL parameter
    const { page = 1, limit = 50 } = request.query; // Pagination parameters

    // Fetch the patient
    const patient: Patient | null = await PatientsRepository.findOne({ where: { id } });
    if (!patient) {
      return response.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Query messages for the given conversationId
    const messages: ChatMessage[] = await ChatMessageRepository.find({
      where: { symptomOccurrenceId: occurrence_id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return response.json({ messages });
  }

}


export { ChatMessageController };