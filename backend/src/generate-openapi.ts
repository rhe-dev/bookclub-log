// OpenAPI 스펙 파일 추출 — `npm run openapi:gen` → backend/openapi.json
// 프론트 codegen(frontend `npm run codegen`)이 이 파일을 읽는다 (D-020)
import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { createOpenApiDocument } from './shared/swagger/openapi';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');
  const document = createOpenApiDocument(app);
  writeFileSync(
    join(process.cwd(), 'openapi.json'),
    JSON.stringify(document, null, 2) + '\n',
  );
  await app.close();
}

generate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[openapi] 스펙 생성 실패:', error);
    process.exit(1);
  });
