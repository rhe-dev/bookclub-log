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
export const toErrorItem = (raw: string, status?: number): ApiErrorItem => {
  // split(sep, 2)는 나머지를 버리므로 첫 구분자 기준으로 직접 나눈다
  const separator = raw.indexOf('|');
  const codePart = separator === -1 ? raw : raw.slice(0, separator);
  const detail = separator === -1 ? '' : raw.slice(separator + 1);
  if (isErrorCode(codePart)) {
    return {
      code: codePart,
      message: detail
        ? `${ERROR_MESSAGE[codePart]} (${detail})`
        : ERROR_MESSAGE[codePart],
    };
  }
  // 코드가 아닌 문자열은 Nest 내장 예외(라우트 미매치 등) — 영문 원문 대신 한글 기본 카피
  if (status === HttpStatus.NOT_FOUND) {
    return {
      code: ErrorCode.NOT_FOUND,
      message: ERROR_MESSAGE[ErrorCode.NOT_FOUND],
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
      errors = rawMessages.map((raw) => toErrorItem(raw, statusCode));
    }

    // 서버 오류는 원인 추적을 위해 항상 로깅 (HttpException 여부가 아니라 상태 코드 기준)
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `서버 오류: ${request.method} ${request.url}`,
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
