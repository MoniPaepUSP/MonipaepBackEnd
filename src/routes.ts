import { Router } from "express";
import {
  DiseaseController,
  FAQSuggestionsController,
  HealthProtocolController,
  USMController,
  VaccineController,
  ComorbidityController,
  PatientController,
  FAQController,
  AboutTheAppController,
  DiseaseOccurrenceController,
  PatientMovementHistoryController,
  PermissionsController,
  RefreshTokenController,
  SymptomController,
  SymptomOccurrenceController,
  SystemUserController,
  SpecialConditionController,
  FAQGroupController
} from "./controllers";
import * as jwt from "./jwt"

const router = Router()

const patientController = new PatientController();
const faqController = new FAQController()
const usmController = new USMController()
const diseaseController = new DiseaseController()
const healthProtocolController = new HealthProtocolController()
const symptomController = new SymptomController()
const diseaseOccurrenceController = new DiseaseOccurrenceController()
const symptomOccurrenceController = new SymptomOccurrenceController()
const patientMovementHistoryController = new PatientMovementHistoryController()
const systemUserController = new SystemUserController()
const permissionsController = new PermissionsController()
const faqSuggestionsController = new FAQSuggestionsController()
const faqGroupController = new FAQGroupController()
const refreshTokenController = new RefreshTokenController()
const aboutController = new AboutTheAppController
const comorbidityController = new ComorbidityController()
const specialConditionController = new SpecialConditionController()

// Refresh Token Routes
router.post("/refreshtoken", refreshTokenController.create)

// Permissions Routes
router.post("/permissions", jwt.authMiddleware, jwt.localAdminMiddleware, permissionsController.create)
router.get("/permissions", jwt.authMiddleware, jwt.localAdminMiddleware, permissionsController.list)
router.put("/permissions/:id", jwt.authMiddleware, jwt.localAdminMiddleware, permissionsController.alterOne)
router.delete("/permissions/:id", jwt.authMiddleware, jwt.localAdminMiddleware, permissionsController.deleteOne)

// SystemUser Routes
router.post("/systemuser/signup", systemUserController.create) //geral *login ira verificar se esta autorizado
router.get("/systemuser/login", systemUserController.login)//geral
router.get("/systemuser", jwt.authMiddleware, jwt.systemUserMiddleware, systemUserController.list)//funcionario autenticado*
router.get("/systemuser/me", jwt.authMiddleware, jwt.systemUserMiddleware, systemUserController.getOneWithToken)//funcionario autenticado
router.put("/systemuser/:id", jwt.authMiddleware, jwt.systemUserMiddleware, systemUserController.alterOne)//funcionario autenticado*
router.put("/systemuser/password/:id", jwt.authMiddleware, jwt.systemUserMiddleware, systemUserController.updatePassword)//funcionario autenticado*
router.delete("/systemuser/:id", jwt.authMiddleware, jwt.localAdminMiddleware, systemUserController.deleteOne)//adm e adm local

// Patient Routes
router.post("/patients/signup", patientController.create) //geral
router.post("/patients/login", patientController.login) //geral
router.get("/patients", jwt.authMiddleware, jwt.systemUserMiddleware, patientController.list) //funcionarios autenticados
router.get("/patients/me", jwt.authMiddleware, patientController.getOneWithToken) //geral autenticado*
router.get("/patients/:id", jwt.authMiddleware, jwt.systemUserMiddleware, patientController.getOne) //funcionarios autenticados
router.put("/patients/alter", jwt.authMiddleware, patientController.alterOne) //geral autenticado*
router.put("/patients/deactivate/:id", jwt.authMiddleware, patientController.deactivateAccount) //geral autenticado*
router.delete("/patients/:id", jwt.authMiddleware, jwt.adminMiddleware, patientController.deleteOne) //funcionarios autenticados

// USM Routes
router.post("/usm", jwt.authMiddleware, jwt.adminMiddleware, usmController.create)//adm e adm local
router.post("/usm/bulk", jwt.authMiddleware, jwt.adminMiddleware, usmController.bulkCreate)//adm e adm local
router.get("/usm", usmController.list)//geral sem autenticacao
router.get("/usm/closeby", jwt.authMiddleware, usmController.listCloseBy)//geral autenticado
router.put("/usm/:id", jwt.authMiddleware, jwt.adminMiddleware, usmController.alterOne)//adm e adm local
router.delete("/usm/:id", jwt.authMiddleware, jwt.adminMiddleware, usmController.deleteOne)//adm e adm local
router.get("/usm/google/places", jwt.authMiddleware, usmController.getGooglePlaces)//geral sem autenticacao

// Disease Routes
router.post("/disease", jwt.authMiddleware, jwt.localAdminMiddleware, diseaseController.create)//adm e adm locais
router.post("/disease/gpt", jwt.authMiddleware, diseaseController.generateWithGPT)
router.get("/disease", diseaseController.list)//geral sem autenticacao
router.put("/disease/:id", jwt.authMiddleware, jwt.localAdminMiddleware, diseaseController.alterOne)///adm e adm locais
router.delete("/disease/:id", jwt.authMiddleware, jwt.localAdminMiddleware, diseaseController.deleteOne)//adm e adm locais

// Health Protocol Routes
router.post("/healthprotocol", jwt.authMiddleware, jwt.usmUserMiddleware, healthProtocolController.create)//usuarios do USM*
router.get("/healthprotocol", jwt.authMiddleware, healthProtocolController.list)//geral autenticado
router.put("/healthprotocol/:id", jwt.authMiddleware, jwt.usmUserMiddleware, healthProtocolController.alterOne)//funcionarios USM*
router.delete("/healthprotocol/:id", jwt.authMiddleware, jwt.usmUserMiddleware, healthProtocolController.deleteOne)//funcionarios USM*

// Symptom Routes
router.post("/symptom", jwt.authMiddleware, jwt.localAdminMiddleware, symptomController.create)//adm e adm locais
router.get("/symptom", symptomController.list)//geral
router.put("/symptom/:id", jwt.authMiddleware, jwt.localAdminMiddleware, symptomController.alterOne)//adm e adm locais
router.delete("/symptom/:id", jwt.authMiddleware, jwt.localAdminMiddleware, symptomController.deleteOne)//adm e adm locais

// DiseaseOccurrence Routes
router.post("/diseaseoccurrence", jwt.authMiddleware, jwt.systemUserMiddleware, diseaseOccurrenceController.create)//geral autenticado*
router.get("/diseaseoccurrence", jwt.authMiddleware, diseaseOccurrenceController.list)//geral autenticado
router.get("/diseaseoccurrence/:id", jwt.authMiddleware, diseaseOccurrenceController.listDiseaseDetails)//geral autenticado
router.put("/diseaseoccurrence/:id", jwt.authMiddleware, jwt.systemUserMiddleware, diseaseOccurrenceController.alterOne)//geral autenticado*
router.delete("/diseaseoccurrence/:id", jwt.authMiddleware, jwt.systemUserMiddleware, diseaseOccurrenceController.deleteOne)//geral autenticado*

// SymptomOccurrence Routes
router.post("/symptomoccurrence", jwt.authMiddleware, symptomOccurrenceController.create)//geral autenticado*
router.get("/symptomoccurrence", jwt.authMiddleware, symptomOccurrenceController.listFromToken)//geral autenticado
router.get("/symptomoccurrence/list", jwt.authMiddleware, jwt.systemUserMiddleware, symptomOccurrenceController.list)//geral autenticado
router.get("/symptomoccurrence/:id", jwt.authMiddleware, symptomOccurrenceController.findOne)//geral autenticado*
router.get("/symptomoccurrence/:id/analysis", jwt.authMiddleware, symptomOccurrenceController.analysis) // geral autenticado*
router.post("/symptomoccurrence/:id/protocol", jwt.authMiddleware, symptomOccurrenceController.protocol) // geral autenticado*
router.put("/symptomoccurrence/:id", jwt.authMiddleware, symptomOccurrenceController.alterOne)//geral autenticado*
router.delete("/symptomoccurrence/:id", jwt.authMiddleware, symptomOccurrenceController.deleteOne)//geral autenticado*

// PatientMovementHistory Routes
router.post("/patientmovementhistory", jwt.authMiddleware, patientMovementHistoryController.create) //geral autenticado*
router.get("/patientmovementhistory", jwt.authMiddleware, patientMovementHistoryController.list) //geral autenticado
router.put("/patientmovementhistory/:id", jwt.authMiddleware, patientMovementHistoryController.alterOne) //geral autenticado*
router.delete("/patientmovementhistory/:id", jwt.authMiddleware, patientMovementHistoryController.deleteOne) //geral autenticado*

// FAQ Group Routes
router.post("/faqgroup", jwt.authMiddleware, jwt.systemUserMiddleware, faqGroupController.create)//usuario de sistema autenticado
router.get("/faqgroup", faqGroupController.list)//geral
router.put("/faqgroup/:id", jwt.authMiddleware, jwt.systemUserMiddleware, faqGroupController.alterOne)//usuario de sistema autenticado
router.delete("/faqgroup/:id", jwt.authMiddleware, jwt.systemUserMiddleware, faqGroupController.deleteOne)//usuario de sistema autenticado

// FAQ Routes
router.post("/faq", jwt.authMiddleware, jwt.systemUserMiddleware, faqController.create)//usuario de sistema autenticado
router.get("/faq", faqController.list)//geral
router.put("/faq/:id", jwt.authMiddleware, jwt.systemUserMiddleware, faqController.alterOne)//usuario de sistema autenticado
router.delete("/faq/:id", jwt.authMiddleware, jwt.systemUserMiddleware, faqController.deleteOne)//usuario de sistema autenticado

// FAQ Suggestions Routes
router.post("/faqsuggestion", jwt.authMiddleware, faqSuggestionsController.create)
router.get("/faqsuggestion", jwt.authMiddleware, jwt.systemUserMiddleware, faqSuggestionsController.list)
router.delete("/faqsuggestion/:id", jwt.authMiddleware, jwt.systemUserMiddleware, faqSuggestionsController.deleteOne)

// About The App Routes
router.post("/about", jwt.authMiddleware, jwt.systemUserMiddleware, aboutController.create)//usuario de sistema autenticado
router.get("/about", aboutController.list)//geral
router.put("/about/:id", jwt.authMiddleware, jwt.systemUserMiddleware, aboutController.alterOne)//usuario de sistema autenticado
router.delete("/about/:id", jwt.authMiddleware, jwt.systemUserMiddleware, aboutController.deleteOne)//usuario de sistema autenticado

// Comorbidity Routes
router.post("/comorbidity", jwt.authMiddleware, jwt.localAdminMiddleware, comorbidityController.create)//adm e adm locais
router.get("/comorbidity", comorbidityController.list)//geral sem autenticacao
router.put("/comorbidity/:id", jwt.authMiddleware, jwt.localAdminMiddleware, comorbidityController.alterOne)///adm e adm locais
router.delete("/comorbidity/:id", jwt.authMiddleware, jwt.localAdminMiddleware, comorbidityController.delete)//adm e adm locais

// SpecialCondition Routes
router.post("/specialcondition", jwt.authMiddleware, jwt.localAdminMiddleware, specialConditionController.create)//adm e adm locais
router.get("/specialcondition", specialConditionController.list)//geral sem autenticacao
router.put("/specialcondition/:id", jwt.authMiddleware, jwt.localAdminMiddleware, specialConditionController.alterOne)///adm e adm locais
router.delete("/specialcondition/:id", jwt.authMiddleware, jwt.localAdminMiddleware, specialConditionController.delete)//adm e adm locais

export { router }
