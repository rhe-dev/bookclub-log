import { Module } from '@nestjs/common';

/** 운영자 앱 — 서버 분리를 가정한 경계 (D-023) */
@Module({ imports: [] })
export class AdminModule {}
