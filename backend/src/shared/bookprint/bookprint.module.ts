import { Global, Module } from '@nestjs/common';
import { BookprintClient } from './bookprint.client';

/**
 * 북프린트 연동 — 서비스 앱(주문 생성 시 사양 검증)과 어드민 앱(발주·웹훅)이 함께 쓴다.
 * 목 클라이언트만 제공하고, 산출·검증 함수들은 순수 함수라 직접 import 한다.
 */
@Global()
@Module({
  providers: [BookprintClient],
  exports: [BookprintClient],
})
export class BookprintModule {}
