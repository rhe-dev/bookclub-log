import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_MESSAGE, ErrorCode, isErrorCode } from '../constants/error-code';

/** 응답 에러 항목 — code가 계약, message는 코드별 기본 한글 카피 (D-028) */
interface ApiErrorItem {
  code: ErrorCode;
  message: string;
}

/**
 * 모든 에러를 { statusCode, errors: [{ code, message }], timestamp, path }로 통일 (D-018·D-028)
 * — 서비스 예외·DTO 검증이 던지는 문자열은 ErrorCode이고, 여기서 기본 메시지를 붙인다.
 *   'CODE|상세' 형태면 상세를 메시지 뒤 괄호로 표기한다 (예: UNKNOWN_FIELD|foo).
 *   코드가 아닌 문자열(외부 라이브러리 메시지 등)은 UNKNOWN 코드로 감싸 원문 유지.
 */
const toErrorItem = (raw: string): ApiErrorItem => {
  const [codePart, detail] = raw.split('|', 2);
  if (isErrorCode(codePart)) {
    return {
      code: codePart,
      message: detail
        ? `${ERROR_MESSAGE[codePart]} (${detail})`
        : ERROR_MESSAGE[codePart],
    };
  }
  return { code: ErrorCode.UNKNOWN, message: raw };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: ApiErrorItem[] = [
      {
        code: ErrorCode.INTERNAL_ERROR,
        message: ERROR_MESSAGE[ErrorCode.INTERNAL_ERROR],
      },
    ];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      let rawMessages: string[];
      if (typeof body === 'string') {
        rawMessages = [body];
      } else {
        const message = (body as { message?: string | string[] }).message;
        rawMessages = Array.isArray(message)
          ? message
          : [message ?? exception.message];
      }
      errors = rawMessages.map(toErrorItem);
    } else {
      this.logger.error(
        `예상하지 못한 오류: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
