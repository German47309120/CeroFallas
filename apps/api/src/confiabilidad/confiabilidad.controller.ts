import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfiabilidadService, ConfiabilidadEquipoDto } from './confiabilidad.service';

@ApiTags('Confiabilidad')
@Controller('confiabilidad')
export class ConfiabilidadController {
  constructor(private readonly confiabilidadService: ConfiabilidadService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Obtener indicadores de confiabilidad operacional (MTBF, MTTR, Disponibilidad) por equipo' })
  @ApiResponse({ status: 200, description: 'Métricas de confiabilidad calculadas formalmente' })
  obtenerKpis(): ConfiabilidadEquipoDto[] {
    return this.confiabilidadService.obtenerKpisConfiabilidad();
  }
}
