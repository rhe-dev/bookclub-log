import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './apps/admin/admin.module';
import { ApisModule } from './apps/apis/apis.module';
import { BookprintModule } from './shared/bookprint/bookprint.module';
import { PrismaModule } from './shared/prisma/prisma.module';

/**
 * 서비스(apps/apis)와 운영자(apps/admin) 앱을 분리하고 shared를 공유한다.
 * 데모는 한 서버로 서빙하지만, 서버 분리를 가정한 경계 (D-023)
 */
@Module({
  imports: [PrismaModule, BookprintModule, ApisModule, AdminModule],
  controllers: [AppController],
})
export class AppModule {}
