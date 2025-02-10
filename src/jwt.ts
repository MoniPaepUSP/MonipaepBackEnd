/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'; 

import { PermissionsRepository, SystemUserRepository } from './repositories'

type TokenPayload = {
  id: string;
  type: string;
  permissions?: string[];
  roles?: string[];
} 

dotenv.config ();  // Load environment variables from .env file 
const secret = process.env.JWT_SECRET

export const sign = (payload: TokenPayload) => jwt.sign (payload, 'asd', { expiresIn: 60 * 60 * 24 })
export const verify = (token: string) => jwt.verify (token, 'asd')

export const authMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  let token
  if (request.headers.authorization) {
    [, token] = request.headers.authorization?.split(' ');
  } else {
    return response.status (401).json ({
      error: 'Token não encontrado',
      code: 'token.not.found'
    })
  }
  
  try {
    verify (token)
    return next ()
  } catch (error) {
    if(error instanceof Error && error.message === 'jwt expired') {
      return response.status (401).json ({
        error: 'Token expirado',
        code: 'token.expired'
      })
    } else {
      return response.status (401).json ({
        error: 'Token inválido e/ou expirado',
        code: 'token.invalid'
      })
    }
  }
}

export const adminMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const id = request.body.tokenPayload.id
  const type = request.body.tokenPayload.type

  if (type !== 'system_user') {
    return response.status (401).json ({
      error: 'Usuário inválido para essa requisição',
      code: 'not.system.user'
    })
  }
  
  // const permissionsRepository = getCustomRepository(PermissionsRepository)

  const user = await PermissionsRepository.findOne ({
    where: {
      userId: id
    }
  })

  if(!user) {
    return response.status (401).json ({
      error: 'Usuário não encontrado',
      code: 'invalid.system.user'
    })
  }
  
  if(user.generalAdm) {
    return next ()
  }
  
  return response.status (401).json ({
    error: 'Usuário sem as permissões necessárias para essa requisição',
    code: 'not.admin'
  })
}

export const localAdminMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const id = request.body.tokenPayload.id
  const type = request.body.tokenPayload.type

  if (type !== 'system_user') {
    return response.status (401).json ({
      error: 'Usuário inválido para essa requisição',
      code: 'not.system.user'
    })
  }
  
  // const permissionsRepository = getCustomRepository(PermissionsRepository)

  const user = await PermissionsRepository.findOne ({
    where: {
      userId: id
    }
  })

  if(!user) {
    return response.status (401).json ({
      error: 'Usuário não encontrado',
      code: 'invalid.system.user'
    })
  }
  
  if(user.localAdm || user.generalAdm) {
    return next ()
  }
  
  return response.status (401).json ({
    error: 'Usuário sem as permissões necessárias para essa requisição',
    code: 'not.local.admin'
  })
}

export const systemUserMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const { id, type } = request.body.tokenPayload

  if (type === 'system_user') {
    // const systemUserRepository = getCustomRepository(SystemUserRepository)
    const isValidId = await SystemUserRepository.findOne ({ where: { id:id } })
    if(isValidId) {
      return next ()
    }
    return response.status (401).json ({
      error: 'Usuário não encontrado',
      code: 'invalid.system.user'
    })
  } else {
    return response.status (401).json ({
      error: 'Usuário inválido para essa requisição',
      code: 'not.system.user'
    })
  }
}

export const usmUserMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  const { id, type } = request.body.tokenPayload

  if (type === 'system_user') {
    // const systemUserRepository = getCustomRepository(SystemUserRepository)
    const isValidId = await SystemUserRepository.findOne ({ where: { id:id } })

    if(!isValidId) {
      return response.status (401).json ({
        error: 'Usuário não encontrado',
        code: 'invalid.system.user'
      })
    } else {
      // const permissionsRepository = getCustomRepository(PermissionsRepository)
      const userPermissions = await PermissionsRepository.findOne ({ where: { userId: id } })
      if(isValidId.department === 'USM' || userPermissions?.generalAdm) {
        return next ()
      } else {
        return response.status (401).json ({
          error: 'Usuário inválido para essa requisição',
          code: 'not.usm.user'
        })
      }
    }
  } else {
    return response.status (401).json ({
      error: 'Usuário inválido para essa requisição',
      code: 'not.system.user'
    })
  }
}