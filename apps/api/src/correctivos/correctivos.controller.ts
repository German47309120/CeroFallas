import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CorrectivosService, CorrectivoRecord } from './correctivos.service';
import { CreateCorrectivoDto } from './dto/create-correctivo.dto';

@ApiTags('Correctivos')
@Controller('correctivos')
export class CorrectivosController {
  constructor(private readonly correctivosService: CorrectivosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros históricos de fallas correctivas' })
  @ApiResponse({ status: 200, description: 'Listado completo de mantenimientos correctivos' })
  findAll(): CorrectivoRecord[] {
    return this.correctivosService.findAll();
  }

  @Get('linea/:linea')
  @ApiOperation({ summary: 'Filtrar mantenimientos correctivos por línea de producción' })
  @ApiParam({ name: 'linea', example: 'LINEA_1', description: 'Nombre de la línea de producción' })
  findByLinea(@Param('linea') linea: string): CorrectivoRecord[] {
    return this.correctivosService.findByLinea(linea);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo mantenimiento correctivo / tiempo muerto de línea' })
  @ApiResponse({ status: 201, description: 'Registro guardado exitosamente y tiempo calculado' })
  create(@Body() createDto: CreateCorrectivoDto): CorrectivoRecord {
    return this.correctivosService.create(createDto);
  }
}
