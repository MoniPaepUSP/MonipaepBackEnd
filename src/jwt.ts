import { Response } from 'express'
// import {  } from 'typeorm'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

import { PermissionsRepository, SystemUserRepository } from './repositories'

type TokenPayload = {
  id: string;
  type: string;
  permissions?: string[];
  roles?: string[];
}

dotenv.config();  // Load environment variables from .env file 
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export const sign = (payload: TokenPayload) => jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 })
export const verify = (token: string) => jwt.verify(token, secret)

export const authMiddleware = async (request: any, response: Response, next: any) => {
  let token
  if (request.headers.authorization) {
    [, token] = request.headers.authorization.split(' ')
  } else {
    return response.status(401).json({
      error: "Token não encontrado",
      code: "token.not.found"
    })
  }

  try {
    const payload: any = verify(token)
    request.tokenPayload = payload
    return next()
  } catch (error: any) {
    if (error.message === "jwt expired") {
      return response.status(401).json({
        error: "Token expirado",
        code: "token.expired"
      })
    } else {
      return response.status(401).json({
        error: "Token inválido e/ou expirado",
        code: "token.invalid"
      })
    }
  }
}

export const adminMiddleware = async (request: any, response: Response, next: any) => {
  const id = request.tokenPayload.id
  const type = request.tokenPayload.type

  if (type !== "system_user") {
    return response.status(401).json({
      error: "Usuário inválido para essa requisição",
      code: "not.system.user"
    })
  }

  // const permissionsRepository = getCustomRepository(PermissionsRepository)

  const user = await PermissionsRepository.findOne({
    where: {
      userId: id
    }
  })

  if (!user) {
    return response.status(401).json({
      error: "Usuário não encontrado",
      code: "invalid.system.user"
    })
  }

  if (user.generalAdm) {
    return next()
  }

  return response.status(401).json({
    error: "Usuário sem as permissões necessárias para essa requisição",
    code: "not.admin"
  })
}

export const localAdminMiddleware = async (request: any, response: Response, next: any) => {
  const id = request.tokenPayload.id
  const type = request.tokenPayload.type

  if (type !== "system_user") {
    return response.status(401).json({
      error: "Usuário inválido para essa requisição",
      code: "not.system.user"
    })
  }

  // const permissionsRepository = getCustomRepository(PermissionsRepository)

  const user = await PermissionsRepository.findOne({
    where: {
      userId: id
    }
  })

  if (!user) {
    return response.status(401).json({
      error: "Usuário não encontrado",
      code: "invalid.system.user"
    })
  }

  if (user.localAdm || user.generalAdm) {
    return next()
  }

  return response.status(401).json({
    error: "Usuário sem as permissões necessárias para essa requisição",
    code: "not.local.admin"
  })
}

export const systemUserMiddleware = async (request: any, response: Response, next: any) => {
  const { id, type } = request.tokenPayload

  if (type === "system_user") {
    // const systemUserRepository = getCustomRepository(SystemUserRepository)
    const isValidId = await SystemUserRepository.findOne({ where: { id: id } })
    if (isValidId) {
      return next()
    }
    return response.status(401).json({
      error: "Usuário não encontrado",
      code: "invalid.system.user"
    })
  } else {
    return response.status(401).json({
      error: "Usuário inválido para essa requisição",
      code: "not.system.user"
    })
  }
}

export const usmUserMiddleware = async (request: any, response: Response, next: any) => {
  const { id, type } = request.tokenPayload

  if (type === "system_user") {
    // const systemUserRepository = getCustomRepository(SystemUserRepository)
    const isValidId = await SystemUserRepository.findOne({ where: { id: id } })

    if (!isValidId) {
      return response.status(401).json({
        error: "Usuário não encontrado",
        code: "invalid.system.user"
      })
    } else {
      // const permissionsRepository = getCustomRepository(PermissionsRepository)
      const userPermissions = await PermissionsRepository.findOne({ where: { userId: id } })

      if (isValidId.department === "USM" || !userPermissions || userPermissions.generalAdm) {
        return next()
      } else {
        return response.status(401).json({
          error: "Usuário inválido para essa requisição",
          code: "not.usm.user"
        })
      }
    }
  } else {
    return response.status(401).json({
      error: "Usuário inválido para essa requisição",
      code: "not.system.user"
    })
  }
}