import { Repository } from "typeorm";
import { AppDataSource } from "src/database";
import { DiseaseKeySymptom } from "src/models/DiseaseKeySymptom";

export const DiseaseKeySymptomRepository: Repository<DiseaseKeySymptom> = AppDataSource.getRepository(DiseaseKeySymptom);