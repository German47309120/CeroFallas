import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PredictivoService, PrediccionRiesgoEquipo } from './predictivo.service';

@ApiTags('Predictivo AI')
@Controller('predictivo')
export class PredictivoController {
  constructor(private readonly predictivoService: PredictivoService) {}

  @Get('riesgo-equipos')
  @ApiOperation({ summary: 'Obtener pronóstico de riesgo de falla y semáforos para todos los equipos' })
  @ApiResponse({ status: 200, description: 'Listado de equipos con probabilidad de falla (7d) y recomendaciones' })
  obtenerRiesgoEquipos(): PrediccionRiesgoEquipo[] {
    return this.predictivoService.obtenerPrediccionesRiesgo();
  }

  @Get('impacto-economico')
  @ApiOperation({ summary: 'Obtener matriz de costos comparativa y ahorro estimado vs mantenimiento reactivo' })
  @ApiResponse({ status: 200, description: 'Costos totales estimados y porcentaje de ahorro' })
  obtenerImpactoEconomico(): Record<string, any> {
    return this.predictivoService.obtenerImpactoEconomico();
  }

  @Get('modelos-metricas')
  @ApiOperation({ summary: 'Obtener métricas de validación científica de los modelos de Machine Learning' })
  @ApiResponse({ status: 200, description: 'Tabla comparativa de métricas (Accuracy, Recall, ROC-AUC, F2-Score)' })
  obtenerMetricasModelos(): any[] {
    return this.predictivoService.obtenerComparativaModelos();
  }

  @Post('ejecutar-pipeline')
  @ApiOperation({ summary: 'Disparar re-entrenamiento y ejecución del pipeline de Machine Learning (MLOps)' })
  @ApiResponse({ status: 200, description: 'Pipeline ejecutado exitosamente' })
  async ejecutarPipeline(): Promise<{ status: string; mensaje: string; duracionMs: number }> {
    return this.predictivoService.ejecutarInferenciaPipeline();
  }
}
