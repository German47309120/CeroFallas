import { Module } from '@nestjs/common';
import { ConfiabilidadController } from './confiabilidad.controller';
import { ConfiabilidadService } from './confiabilidad.service';
import { CorrectivosModule } from '../correctivos/correctivos.module';

@Module({
  imports: [CorrectivosModule],
  controllers: [ConfiabilidadController],
  providers: [ConfiabilidadService],
  exports: [ConfiabilidadService],
})
export class ConfiabilidadModule {}
