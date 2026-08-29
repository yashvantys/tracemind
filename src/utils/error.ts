export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string,
    code = "BAD_REQUEST",
  ) {
    super(message, 400, code);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    code = "NOT_FOUND",
  ) {
    super(message, 404, code);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "Internal server error",
    code = "INTERNAL_SERVER_ERROR",
  ) {
    super(message, 500, code);
    this.name = "InternalServerError";
  }
}