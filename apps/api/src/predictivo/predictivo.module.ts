import { Module } from '@nestjs/common';
import { PredictivoController } from './predictivo.controller';
import { PredictivoService } from './predictivo.service';

@Module({
  controllers: [PredictivoController],
  providers: [PredictivoService],
  exports: [PredictivoService],
})
export class PredictivoModule {}
