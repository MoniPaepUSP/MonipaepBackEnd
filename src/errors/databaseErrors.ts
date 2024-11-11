import { HttpCode, HttpError, HttpErrorArgs } from '../common/appError'

export abstract class DatabaseError extends HttpError {
  constructor(args: HttpErrorArgs) {
    super({
      httpCode: args.httpCode,
      message: args.message,
      apiContext: `DATABASE_ERROR-${args.apiContext}`,
    })
  }
}

export class ConnectionError extends DatabaseError {
  constructor(
    message?: 'Não foi possivel obter uma conexão com a base de dados'
  ) {
    super({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      message,
      apiContext: 'CONNECTION_ERROR',
    })
  }
}

export class BadImplementedError extends DatabaseError {
  constructor(
    message?: 'A base de dados está incompleta ou mal implementada'
  ) {
    super({
      httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      message,
      apiContext: 'BAD_IMPLEMENTED',
    })
  }
}