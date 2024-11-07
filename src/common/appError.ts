export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export interface HttpErrorArgs {
  apiContext: string;
  httpCode: HttpCode;
  message: string;
}

export class HttpError extends Error {
  public readonly httpCode: httpCode;
  public readonly apiContext: string;
  public readonly message: string;

  constructor(args: HttpErrorArgs) {
    super(args.message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = args.httpCode;
    this.apiContext = args.apiContext;
    this.message = args.message;

    Error.captureStackTrace(this);
  }
}
