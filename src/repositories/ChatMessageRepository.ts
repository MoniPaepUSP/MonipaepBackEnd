import { Repository } from "typeorm";
import { ChatMessage } from "../models";
import { AppDataSource } from "src/database";

export const ChatMessageRepository: Repository<ChatMessage> = AppDataSource.getRepository(ChatMessage);