import { Module } from '@nestjs/common';
import { CorrectivosController } from './correctivos.controller';
import { CorrectivosService } from './correctivos.service';

@Module({
  controllers: [CorrectivosController],
  providers: [CorrectivosService],
  exports: [CorrectivosService],
})
export class CorrectivosModule {}
