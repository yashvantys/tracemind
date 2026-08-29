import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import {
  AppError,
  InternalServerError,
} from "../utils/error.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Zod validation errors
    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: error.issues,
        },
      });
    }

    // Application errors
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Unexpected errors
    const internalError = new InternalServerError();
    return reply.code(internalError.statusCode).send({
      success: false,
      error: {
        code: internalError.code,
        message: internalError.message,
      },
    });
  });
}