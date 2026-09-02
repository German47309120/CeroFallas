import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateCorrectivoDto {
  @ApiProperty({ example: 'LINEA_1', description: 'Línea de producción asignada (LINEA_1, LINEA_2, etc.)' })
  @IsString()
  @IsNotEmpty()
  linea: string;

  @ApiProperty({ example: 'BATIDORA', description: 'Equipo o máquina intervenida' })
  @IsString()
  @IsNotEmpty()
  equipo: string;

  @ApiProperty({ example: '2026-08-31', description: 'Fecha del evento en formato YYYY-MM-DD o DD/MM/YYYY' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'Carlos Mendoza', description: 'Nombre del técnico responsable' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '1', description: 'Turno de operación (1 o 2)' })
  @IsString()
  @IsNotEmpty()
  turno: string;

  @ApiProperty({ example: 'FALLA BATIDORA', description: 'Categoría de la falla' })
  @IsString()
  @IsNotEmpty()
  falla: string;

  @ApiProperty({
    example: 'Sobrecalentamiento en motor principal y desgaste de fajas de transmisión. Se procedió a tensado y lubricación.',
    description: 'Descripción detallada de la intervención (mínimo 10 caracteres)',
  })
  @IsString()
  @MinLength(10)
  descripcion: string;

  @ApiProperty({ example: '2026-08-31T08:30', description: 'Hora de inicio de paro' })
  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @ApiProperty({ example: '2026-08-31T09:45', description: 'Hora de finalización y entrega a producción' })
  @IsString()
  @IsNotEmpty()
  horaFinal: string;

  @ApiProperty({ example: 75, description: 'Minutos totales de paro de línea calculados' })
  @IsNumber()
  minutos: number;

  @ApiProperty({ example: 'FINALIZADO', description: 'Estado del mantenimiento (PENDIENTE, FINALIZADO)' })
  @IsString()
  @IsOptional()
  estado?: string;
}
