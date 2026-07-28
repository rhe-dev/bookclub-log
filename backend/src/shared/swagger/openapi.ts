import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponse } from '../dto/api-error.response';

/** main.ts(문서 UI)와 generate-openapi.ts(스펙 파일 추출)가 공유하는 스펙 생성기 */
export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('북클럽 로그 API')
    .setDescription(
      '모임 책방·토론·문집 주문 API. 쓰기 요청은 X-Member-Id 헤더(멤버 publicId)로 현재 멤버를 식별한다.',
    )
    .setVersion('1.0')
    .build();
  return SwaggerModule.createDocument(app, config, {
    // 어느 엔드포인트에도 매이지 않는 공통 에러 응답을 스펙에 싣는다 (D-028)
    extraModels: [ApiErrorResponse],
  });
}
