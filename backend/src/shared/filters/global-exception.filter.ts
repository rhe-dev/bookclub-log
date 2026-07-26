import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorMessage } from '../constants/error-message';

/**
 * 모든 에러를 { statusCode, messages: string[], timestamp, path } 한 가지 형태로 통일 (D-018)
 * — ValidationPipe의 배열 메시지, 도메인 예외의 단일 메시지, 예상 못한 500까지 동일 포맷.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages: string[] = [ErrorMessage.INTERNAL_ERROR];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        messages = [body];
      } else {
        const message = (body as { message?: string | string[] }).message;
        messages = Array.isArray(message)
          ? message
          : [message ?? exception.message];
      }
    } else {
      this.logger.error(
        `예상하지 못한 오류: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      messages,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
