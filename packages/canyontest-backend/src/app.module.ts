import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {PrismaModule} from "./prisma/prisma.module";
import {join} from "path";
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../canyontest-platform', 'dist'),
      exclude: ['/graphql/(.*)'],
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
