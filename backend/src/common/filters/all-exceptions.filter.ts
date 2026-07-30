import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
      this.logger.error('Unhandled error', exception as Error);
    }

    response.status(status).json(body);
  }
}
