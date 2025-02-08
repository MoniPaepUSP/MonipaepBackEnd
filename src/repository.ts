import { EntityTarget, ObjectLiteral, Repository } from 'typeorm'
import { AppDataSource } from './database'
import {
  AboutTheApp,
  Appointment,
  AssignedHealthProtocol,
  DiseaseOccurrence,
  Disease,
  FAQ,
  FAQSuggestions,
  HealthProtocol,
  PatientMovementHistory,
  Patient,
  Permissions,
  RefreshToken,
  SymptomOccurrence,
  Symptom,
  SystemUser,
  USM,
  Vaccine,
} from './models'

function createRepository<T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Repository<T> {
  return AppDataSource.getRepository<T>(entity)
}

export const AboutTheAppRepository = createRepository(AboutTheApp)
export const AppointmentsRepository = createRepository(Appointment)
export const AssignedHealthProtocolRepository = createRepository(
  AssignedHealthProtocol
)
export const DiseaseOccurrenceRepository = createRepository(DiseaseOccurrence)
export const DiseaseRepository = createRepository(Disease)
export const FAQRepository = createRepository(FAQ)
export const FAQSuggestionsRepository = createRepository(FAQSuggestions)
export const HealthProtocolRepository = createRepository(HealthProtocol)
export const PatientMovementHistoryRepository = createRepository(
  PatientMovementHistory
)
export const PatientsRepository = createRepository(Patient)
export const PermissionsRepository = createRepository(Permissions)
export const RefreshTokenRepository = createRepository(RefreshToken)
export const SymptomOccurrenceRepository = createRepository(SymptomOccurrence)
export const SymptomRepository = createRepository(Symptom)
export const SystemUserRepository = createRepository(SystemUser)
export const USMRepository = createRepository(USM)
export const VaccinesRepository = createRepository(Vaccine)
