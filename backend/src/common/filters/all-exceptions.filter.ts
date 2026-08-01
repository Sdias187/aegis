import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = {
      type: 'SERVER',
      message: 'Erro interno do servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse() as Record<string, unknown>;
    } else {
      // Ornecedor: erros do oracledb podem conter estruturas circulares
      // (ConnectDescription -> cOpts -> ConnOption) que quebram o JSON.stringify
      const err = exception as Error;
      const message = err?.message ?? this.safeStringify(exception);
      const stack = err?.stack ?? '';
      this.logger.error(`Unhandled error: ${message}`, stack);
      body = { type: 'SERVER', message };
    }

    response.status(status).json(body);
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}
