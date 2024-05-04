import { Request, Response } from "express";
import * as jwt from "../jwt"

import bcrypt from 'bcrypt'
import { RefreshToken, SystemUser } from "../models";
import { refreshTokenExpiresIn } from "src/refreshTokenExpiration";

import { SystemUserRepository, PermissionsRepository, RefreshTokenRepository } from "src/repositories";
class SystemUserController {


  async create(request: Request, response: Response) {


    const body = request.body

    // const systemUserRepository = AppDataSource.getRepository(SystemUser);
    console.log("creating user: " ,body  );
    const userAlreadyExists = await SystemUserRepository.findOne({
      where: [
        { CPF: body.CPF },
        { email: body.email }
      ],
      
    })

    console.log("aaa");

    if (userAlreadyExists) {
      return response.status(400).json({
        error: "Email e/ou CPF já cadastrados."
      })
    }

    body.createdAt = new Date()

    try {
      const user = SystemUserRepository.create(body)
      const userSaved: any = await SystemUserRepository.save(user)
      const permissions = PermissionsRepository.create({
        userId: userSaved.id,
        localAdm: false,
        generalAdm: false,
        authorized: false
      })
      await PermissionsRepository.save(permissions)
    
      userSaved.password = undefined      
      return response.status(201).json({
        success: "Usuário criado com sucesso."
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na criação do usuário."
      })
    }
  }

  async login(request: Request, response: Response) {
    // this.initializeRepositories();

    let hash
    
    try {
      [, hash] = request.headers.authorization.split(' ')
    } catch (error) {
      return response.status(401).json({
        error: "Credenciais necessárias."
      })
    }

    const [email, password] = Buffer.from(hash, 'base64').toString().split(':')
    
    const userExists = await SystemUserRepository.findOne({
      where: { email }, 
      select: ['id', 'email', 'password', 'name', 'department']
    })

    if (!userExists) {
      return response.status(401).json({
        error: "Email e/ou senha inválidos."
      })
    }

    const systemUserId = userExists.id
    const validPassword = await bcrypt.compare(password, userExists.password)

    if(!validPassword) {
      return response.status(400).json({
        error: "Email e/ou senha inválidos."
      })
    }

    try {
      const userPermissions = await PermissionsRepository.findOne({
        where: {
          userId: systemUserId
        }
      })

      if(!userPermissions) {
        return response.status(400).json({
          error: "Usuário sem permissões cadastradas"
        })
      }

      if(!userPermissions.authorized) {
        return response.status(400).json({
          error: "Usuário não autorizado por um administrador",
        })
      }
      
      const refreshTokenExists = await RefreshTokenRepository.findOne({
        where: {
          systemUserId : systemUserId
        }
      })
      
      if(refreshTokenExists) {
        await RefreshTokenRepository.createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("systemUserId = :id", { id: systemUserId })
        .execute()
      }

      const refreshTokenBody = RefreshTokenRepository.create({
        systemUserId,
        expiresIn: refreshTokenExpiresIn()
      })

      const refreshToken = await RefreshTokenRepository.save(refreshTokenBody)

      userExists.password = undefined
      const permissions: string[] = []
      const roles: string[] = ['system.user']

      if(userExists.department === "USM") {
        permissions.push('usm.user')
      }

      if(userExists.department === "SVS") {
        permissions.push('svs.user')
      }

      if(userPermissions.localAdm) {
        roles.push('local.admin')
      }

      if(userPermissions.generalAdm) {
        roles.push('general.admin')
      }

      const token = jwt.sign({
        id: systemUserId,
        type: 'system_user',
        permissions,
        roles,
      })

      return response.status(200).json({
        user: userExists,
        permissions,
        roles,
        token,
        refreshToken: refreshToken.id,
      })

    } catch (error) {
      return response.status(400).json({
        error: "Erro no login"
      })
    }
  }

  async list(request: Request, response: Response) {
    // this.initializeRepositories();

    const { id, department } = request.query
    let filters = {}
    

    if(id) {
      filters = { ...filters, id: String(id) }

      const user = await SystemUserRepository.findOne({
        where: {
          id: String(id)
        }
      })
    
      if(!user){
        return response.status(404).json({
          error: "Usuário não encontrado"
        })
      }
    }

    if(department) {
      filters = { ...filters, department: String(department) }
    }

    const users = await SystemUserRepository.find(filters)

    return response.status(200).json(users)
  }

  async getOneWithToken(request, response: Response) {
    // this.initializeRepositories();

    const { id, type } = request.tokenPayload

    if(type !== 'system_user') {
      return response.status(401).json({
        error: "Token inválido para essa requisição"
      })
    }
    

    const user = await SystemUserRepository.findOne({
      where: { id }, 
      select: ['id', 'email', 'password', 'name', 'department']
    })

    if(!user) {
      return response.status(401).json({
        error: "Usuário inválido"
      })
    }

    const userPermissions = await PermissionsRepository.findOne({
      where: {
        userId: id
      }
    })

    if(!userPermissions) {
      return response.status(400).json({
        error: "Usuário sem permissões cadastradas"
      })
    }


    user.password = undefined
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

    return response.status(200).json({
      user,
      permissions,
      roles,
    })
  }

  async updatePassword(request, response: Response) {
    // this.initializeRepositories();

    const tokenPayload = request.tokenPayload
    const { current_password, new_password } = request.body
    const { id } = request.params

    if(id !== tokenPayload.id || current_password === undefined || new_password === undefined){
      return response.status(401).json({
        error: "Operação proibida"
      })
    }

    
    const userExists = await SystemUserRepository.findOne({
      where: { id }, 
      select: ['password']
    })
    
    if (!userExists) {
      return response.status(401).json({
        error: "Usuário inválido."
      })
    }

    const isValidPassword = await bcrypt.compare(current_password, userExists.password)

    if(!isValidPassword) {
      return response.status(400).json({
        error: "Senha atual inválida."
      })
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10)
    
    try {
      await SystemUserRepository.createQueryBuilder()
        .update(SystemUser)
        .set({ password: newPasswordHash })
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Senha atualizada com sucesso."
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização da senha."
      })
    }
  }

  async alterOne(request: Request, response: Response) {
    // this.initializeRepositories();

    const body = request.body
    const { id } = request.params

    const userExists = await SystemUserRepository.findOne({ where: { id:id} })

    if(!userExists){
      return response.status(401).json({
        error: "Usuário inválido"
      })
    }
    
    if(body.password){
      const hash = await bcrypt.hash(body.password, 10)
      body.password = hash
    }

    try {
      await SystemUserRepository.createQueryBuilder()
        .update(SystemUser)
        .set(body)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Usuário atualizado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na atualização do usuário"
      })
    }
  }

  async deleteOne(request: Request, response: Response) {
    // this.initializeRepositories();

    const { id } = request.params

    const userExists = await SystemUserRepository.findOne({ where: {id :id} })

    if(!userExists){
      return response.status(401).json({
        error: "Usuário inválido"
      })
    }

    try {
      await SystemUserRepository.createQueryBuilder()
        .delete()
        .from(SystemUser)
        .where("id = :id", { id })
        .execute()
      return response.status(200).json({
        success: "Usuário deletado com sucesso"
      })
    } catch (error) {
      return response.status(403).json({
        error: "Erro na deleção do usuário"
      })
    }
  }
}

export { SystemUserController }