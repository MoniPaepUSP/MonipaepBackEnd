import { Request, Response } from "express";
// import { getCustomRepository } from "typeorm";
import dayjs from 'dayjs'
import * as jwt from "../jwt"

import { Permissions, RefreshToken, SystemUser } from "../models";
// import { PermissionsRepository, RefreshTokenRepository, SystemUserRepository } from "../repositories";
import { refreshTokenExpiresIn } from "../refreshTokenExpiration";
import { Repository } from "typeorm";
import { AppDataSource } from "src/database";

class RefreshTokenController {
  private refreshTokenRepository : Repository<RefreshToken>;
  private permissionsRepository : Repository<Permissions>;
  private systemUserRepository : Repository<SystemUser>;

  constructor() {
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.permissionsRepository = AppDataSource.getRepository(Permissions);
    this.systemUserRepository = AppDataSource.getRepository(SystemUser);
  }

  async create(request: Request, response: Response){
    const { refreshToken } = request.body


    const refreshTokenExists = await this.refreshTokenRepository.findOne({
      where: {
        id: refreshToken
      }
    })

    if(!refreshTokenExists) {
      return response.status(401).json({
        error: "Refresh token não encontrado",
        code: "refresh.token.invalid"
      })
    }

    const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshTokenExists.expiresIn))

    if(refreshTokenExpired) {
      try {
        await this.refreshTokenRepository.createQueryBuilder()
          .delete()
          .from(RefreshToken)
          .where("id = :id", { id: refreshTokenExists.id })
          .execute();
      } catch (error) {
        return response.status(401).json({
          error: "Erro na deleção do refresh token",
          code: "refresh.token.deletion"
        })
      }

      return response.status(401).json({
        error: "Refresh token expirado",
        code: "refresh.token.expired"
      })
    } 

    const isPatientId = refreshTokenExists.patientId
    const isSystemUserId = refreshTokenExists.systemUserId

    try {
      await this.refreshTokenRepository.createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("id = :id", { id: refreshTokenExists.id })
        .execute();

      if(isPatientId) {
        const token = jwt.sign({
          id: isPatientId,
          type: 'patient'
        })

        const refreshTokenBody = this.refreshTokenRepository.create({
          patientId: isPatientId,
          expiresIn: refreshTokenExpiresIn()
        })

        const refreshToken = await this.refreshTokenRepository.save(refreshTokenBody)
        
        return response.status(200).json({ isPatientId, token, refreshToken })

      } else if(isSystemUserId) {

        const user = await this.systemUserRepository.findOne({
          where: {
            id: isSystemUserId
          }
        })

        if(!user) {
          return response.status(401).json({
            error: "Usuário inválido",
            code: "refresh.token.generation"
          })
        }

        const userPermissions = await this.permissionsRepository.findOne({
          where: {
            userId: isSystemUserId
          }
        })

        if(!userPermissions) {
          return response.status(401).json({
            error: "Permissões não encontradas",
            code: "refresh.token.generation"
          })
        }

        if(!userPermissions.authorized) {
          return response.status(401).json({
            error: "Usuário desautorizado",
            code: "refresh.token.generation"
          })
        }

        const permissions: string[] = []
        const roles: string[] = ['system.user']

        if(user.department === "USM") {
          permissions.push('usm.user')
        }

        if(user.department === "SVS") {
          permissions.push('svs.user')
        }

        if(userPermissions.localAdm) {
          roles.push('local.admin')
        }

        if(userPermissions.generalAdm) {
          roles.push('general.admin')
        }
        
        const token = jwt.sign({
          id: isSystemUserId,
          type: 'system_user',
          permissions,
          roles
        })

        const refreshTokenBody = this.refreshTokenRepository.create({
          systemUserId: isSystemUserId,
          expiresIn: refreshTokenExpiresIn()
        })

        const refreshToken = await this.refreshTokenRepository.save(refreshTokenBody)
        
        return response.status(200).json({ token, refreshToken: refreshToken.id })

      } else {
        return response.status(401).json({
          error: "Erro na geração do refresh token",
          code: "refresh.token.generation"
        })
      }
    } catch (error) {
      return response.status(401).json({
        error: "Erro na criação do refresh token",
        code: "refresh.token.creation"
      })
    }
  }
}

export { RefreshTokenController }