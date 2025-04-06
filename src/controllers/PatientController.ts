import { Request, Response } from "express";
import { Like } from 'typeorm';
import bcrypt from 'bcrypt'

import * as jwt from "../jwt"
import { Patient, RefreshToken } from "../models";
import { RefreshTokenRepository, PatientsRepository, ComorbidityRepository, SpecialConditionRepository } from "../repositories";
import { refreshTokenExpiresIn } from "../refreshTokenExpiration";
import { PatientAlreadyExistsError } from "../errors/patient.errors";
import { HttpError } from "src/common/app.errors";
import { GeneralInternalError } from "src/errors/unknown.errors";

class PatientController {
  async create(request: Request, response: Response) {
    const body = request.body;
    const { cpf, email, password } = body;

    if (!cpf || !email || !password) {
      return response.status(400).json({
        error: "CPF, email e senha são obrigatórios",
      });
    }

    const patientAlreadyExists = await PatientsRepository.findOne({
      where: [
        { cpf },
        { email }
      ]
    });

    if (patientAlreadyExists) {
      throw new PatientAlreadyExistsError();
    }

    body.status = "Saudável";
    body.createdAt = new Date();
    body.lastUpdate = body.createdAt;

    try {
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
      body.password = hashedPassword;

      const patientBody = PatientsRepository.create(body);
      const patient: any = await PatientsRepository.save(patientBody);
      const patientId = patient.id;

      const refreshTokenBody = RefreshTokenRepository.create({
        patientId,
        expiresIn: refreshTokenExpiresIn()
      });

      const refreshToken = await RefreshTokenRepository.save(refreshTokenBody);

      const token = jwt.sign({
        id: patient.id,
        type: 'patient'
      });

      // Avoid exposing sensitive data
      patient.password = undefined;

      return response.status(201).json({
        success: "Paciente criado com sucesso",
        patient,
        token,
        refreshToken
      });
    } catch (error) {
      console.error("Error creating patient:", error);

      if (error instanceof HttpError) {
        return response.status(error.httpCode).json({
          apiContext: error.apiContext,
          httpCode: error.httpCode,
          message: error.message,
          externalServiceError: error.externalServiceError
        });
      }

      const unknownError = new GeneralInternalError();

      return response.status(unknownError.httpCode).json({
        apiContext: unknownError.apiContext,
        httpCode: unknownError.httpCode,
        message: unknownError.message,
        externalServiceError: unknownError.externalServiceError
      });
    }
  }

  async login(request: Request, response: Response) {
    const { cpf, password } = request.body;

    if (!cpf || !password) {
      return response.status(400).json({
        error: "CPF e senha são obrigatórios",
      });
    }

    try {
      const patientExists: any = await PatientsRepository.findOne({
        where: { cpf },
        select: ['id', 'cpf', 'password'],
      });

      if (!patientExists) {
        return response.status(401).json({
          error: "Paciente não encontrado",
        });
      }

      const validPassword = await bcrypt.compare(password, patientExists.password);
      if (!validPassword) {
        return response.status(401).json({
          error: "Senha inválida",
        });
      }

      const patientId = patientExists.id;

      const token = jwt.sign({
        id: patientId,
        type: 'patient',
      });

      // Remove any existing refresh tokens for this patient
      await RefreshTokenRepository.createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("patientId = :id", { id: patientId })
        .execute();

      const refreshTokenBody = RefreshTokenRepository.create({
        patientId,
        expiresIn: refreshTokenExpiresIn(),
      });

      const refreshToken = await RefreshTokenRepository.save(refreshTokenBody);

      const patient = await PatientsRepository.findOne({
        where: { cpf },
        relations: ['comorbidities', 'specialConditions'],
        select: [
          'id',
          'name',
          'cpf',
          'email',
          'status',
          'gender',
          'phone',
          'allowSms',
          'workAddress',
          'homeAddress',
          'neighborhood',
          'houseNumber',
          'hasHealthPlan',
          'birthdate',
          'status',
          'activeAccount',
        ],
      });

      if (!patient) {
        return response.status(404).json({
          error: "Paciente não encontrado",
        });
      }

      refreshToken.patientId = null; // Avoid exposing sensitive data

      return response.status(200).json({
        patient,
        token,
        refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      return response.status(500).json({
        error: "Erro interno no servidor",
      });
    }
  }

  async list(request: Request, response: Response) {
    const {
      id,
      name,
      cpf,
      gender,
      neighborhood,
      status,
      active,
      page } = request.query
    let filters = {}

    if (id) {
      filters = { ...filters, id: String(id) }

      const patient = await PatientsRepository.findOne({
        where: { id: String(id) }
      })

      if (!patient) {
        return response.status(404).json({
          error: "Paciente não encontrado"
        })
      }
    }

    if (status) {
      filters = { ...filters, status: Like(`%${String(status).toUpperCase()}%`) }
    }

    if (active) {
      if (active === "true") {
        filters = { ...filters, activeAccount: true }
      } else {
        filters = { ...filters, activeAccount: false }
      }
    }

    if (name) {
      filters = { ...filters, name: Like(`%${String(name)}%`) }
    }

    if (cpf) {
      filters = { ...filters, CPF: Like(`%${String(cpf)}%`) }
    }

    if (gender) {
      filters = { ...filters, gender: Like(`%${String(gender)}%`) }
    }

    if (neighborhood) {
      filters = { ...filters, neighborhood: Like(`%${String(neighborhood)}%`) }
    }

    let options: any = {
      where: filters,
      order: {
        createdAt: 'DESC'
      },
    }

    if (page) {
      const take = 10
      options = { ...options, take, skip: ((Number(page) - 1) * take) }
    }

    const patientsList = await PatientsRepository.findAndCount(options)
    return response.json({
      patients: patientsList[0],
      totalPatients: patientsList[1]
    })
  }

  async getOneWithToken(request: any, response: Response) {
    const { id, type } = request.tokenPayload

    if (type !== 'patient') {
      return response.status(401).json({
        error: "Token inválido para essa requisição"
      })
    }

    const patient = await PatientsRepository.findOne({
      where: { id },
      relations: ['comorbidities', 'specialConditions'],
      select: [
        'id',
        'name',
        'cpf',
        'email',
        'status',
        'gender',
        'phone',
        'allowSms',
        'workAddress',
        'homeAddress',
        'neighborhood',
        'houseNumber',
        'hasHealthPlan',
        'birthdate',
        'status',
        'activeAccount',
      ],
    });

    if (!patient) {
      return response.status(401).json({
        error: "Paciente inválido"
      })
    }

    return response.status(200).json(patient)
  }

  async alterOne(request: any, response: Response) {
    const { id } = request.tokenPayload
    const body = request.body;

    const patient = await PatientsRepository.findOne({ where: { id: id } });
    if (!patient) {
      return response.status(404).json({
        error: "Paciente não encontrado"
      });
    }

    // Build an object with only the provided fields except many-to-many relationships
    const updateData: any = {};
    let updateComorbiditiesIds: string[] | undefined;
    let updateSpecialConditionsIds: string[] | undefined;

    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        if (key === 'comorbidities') {
          updateComorbiditiesIds = body.comorbidities;
        } else if (key === 'specialConditions') {
          updateSpecialConditionsIds = body.specialConditions;
        } else if (key === 'password') {
          // Only update password if provided and non-empty
          if (typeof body.password === 'string' && body.password.trim() !== '') {
            updateData.password = await bcrypt.hash(body.password.trim(), 10);
          }
        } else {
          updateData[key] = body[key];
        }
      }
    }

    try {

      // Update the patient with the provided fields
      // Exclude comorbidities from the updateData object
      if (Object.keys(updateData).length > 0) {
        await PatientsRepository.createQueryBuilder()
          .update(Patient)
          .set(updateData)
          .where("id = :id", { id })
          .execute();
      }

      // If comorbidities were provided, update the many-to-many relationship separately
      if (updateComorbiditiesIds !== undefined) {

        if (updateComorbiditiesIds.length === 0) {
          // If no comorbidities are provided, clear the existing relationship
          patient.comorbidities = [];
          await PatientsRepository.save(patient);
        } else {
          // Fetch the comorbidities from the database
          const comorbidities = await ComorbidityRepository.find({
            where: updateComorbiditiesIds.map((id: string) => ({ id })),
          });

          // Check if all comorbidities exist
          if (comorbidities.length !== updateComorbiditiesIds.length) {
            return response.status(404).json({
              error: "Comorbidade não encontrada"
            });
          }

          // Update the many-to-many relationship
          patient.comorbidities = comorbidities;
          await PatientsRepository.save(patient);
        }
      }

      if (updateSpecialConditionsIds !== undefined) {
        // Fetch the special conditions from the database
        const specialConditions = await SpecialConditionRepository.find({
          where: updateSpecialConditionsIds.map((id: string) => ({ id })),
        });

        // Check if all special conditions exist
        if (specialConditions.length !== updateSpecialConditionsIds.length) {
          return response.status(404).json({
            error: "Condição especial não encontrada"
          });
        }

        // Update the many-to-many relationship
        patient.specialConditions = specialConditions;
        await PatientsRepository.save(patient);
      }

      // Fetch the updated patient
      const updatedPatient = await PatientsRepository.findOne({
        where: { id },
        relations: ['comorbidities', 'specialConditions'],
        select: [
          'id',
          'name',
          'cpf',
          'email',
          'status',
          'gender',
          'phone',
          'allowSms',
          'workAddress',
          'homeAddress',
          'neighborhood',
          'houseNumber',
          'hasHealthPlan',
          'birthdate',
          'status',
          'activeAccount',
        ],
      });

      return response.status(200).json({
        success: "Paciente atualizado com sucesso",
        patient: updatedPatient,
      });
    } catch (error) {
      console.error("Update error:", error);
      return response.status(403).json({
        error: "Erro na atualização do paciente"
      });
    }
  }

  async deleteOne(request: Request, response: Response) {
    const { id } = request.params


    const patient = await PatientsRepository.findOne({ where: { id: id } })

    if (!patient) {
      return response.status(404).json({
        error: "Paciente não encontrado"
      })
    }

    try {
      await PatientsRepository.createQueryBuilder()
        .delete()
        .from(Patient)
        .where("id = :id", { id })
        .execute();
      return response.status(200).json({
        success: "Paciente deletado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção do paciente"
      })
    }
  }

  async deactivateAccount(request: Request, response: Response) {
    const { id } = request.params

    const patient = await PatientsRepository.findOne({ where: { id: id } })

    if (!patient) {
      return response.status(404).json({
        error: "Paciente não encontrado"
      })
    }

    try {
      await PatientsRepository.createQueryBuilder()
        .update(Patient)
        .set({ activeAccount: false })
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Conta desativada com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na desativação da conta"
      })
    }
  }
}

export { PatientController }