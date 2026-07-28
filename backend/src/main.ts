import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ErrorCode } from './shared/constants/error-code';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { createOpenApiDocument } from './shared/swagger/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // 스펙에 없는 필드는 조용히 버리지 않고 에러로 — 오타 필드가 no-op으로 숨는 것 방지
      forbidNonWhitelisted: true,
      transform: true,
      // 검증 실패는 ErrorCode 문자열로 던진다 — 전역 필터가 코드별 메시지를 붙임 (D-028)
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors.flatMap((error) =>
            Object.entries(error.constraints ?? {}).map(([key, value]) =>
              key === 'whitelistValidation'
                ? `${ErrorCode.UNKNOWN_FIELD}|${error.property}`
                : value,
            ),
          ),
        ),
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  // 데모 범위: 도커 프론트·로컬 dev origin이 섞여 전체 허용 — 프로덕션 전 origin 고정 필요 (D-003)
  app.enableCors();
  SwaggerModule.setup('api/docs', app, createOpenApiDocument(app));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap().catch((error) => {
  console.error('[bootstrap] 기동 실패:', error);
  process.exit(1);
});
