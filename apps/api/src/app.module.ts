import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CorrectivosModule } from './correctivos/correctivos.module';
import { ConfiabilidadModule } from './confiabilidad/confiabilidad.module';
import { PredictivoModule } from './predictivo/predictivo.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CorrectivosModule,
    ConfiabilidadModule,
    PredictivoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
