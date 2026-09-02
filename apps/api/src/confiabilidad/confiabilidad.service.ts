import { Injectable } from '@nestjs/common';
import { CorrectivosService } from '../correctivos/correctivos.service';

export interface ConfiabilidadEquipoDto {
  linea: string;
  equipo: string;
  totalFallas: number;
  horasTotalesParo: number;
  mttrHoras: number;
  mtbfHoras: number;
  disponibilidadPct: number;
  estadoConfiabilidad: 'OPTIMA' | 'MONITOREO' | 'CRITICA';
}

@Injectable()
export class ConfiabilidadService {
  constructor(private readonly correctivosService: CorrectivosService) {}

  obtenerKpisConfiabilidad(): ConfiabilidadEquipoDto[] {
    const correctivos = this.correctivosService.findAll();
    const grupos: Record<string, { linea: string; equipo: string; fallas: number; minutosParo: number }> = {};

    for (const c of correctivos) {
      const key = `${c.linea}__${c.equipo}`;
      if (!grupos[key]) {
        grupos[key] = {
          linea: c.linea,
          equipo: c.equipo,
          fallas: 0,
          minutosParo: 0,
        };
      }
      grupos[key].fallas += 1;
      grupos[key].minutosParo += c.minutos || 0;
    }

    const resultado: ConfiabilidadEquipoDto[] = [];
    const HORAS_BASE_OPERACION = 365 * 16; // 1 año x 2 turnos de 8 horas = 5,840 horas

    for (const key in grupos) {
      const g = grupos[key];
      const horasParo = +(g.minutosParo / 60).toFixed(2);
      const mttr = g.fallas > 0 ? +(horasParo / g.fallas).toFixed(2) : 0;
      const horasNetas = Math.max(1, HORAS_BASE_OPERACION - horasParo);
      const mtbf = g.fallas > 0 ? +(horasNetas / g.fallas).toFixed(2) : HORAS_BASE_OPERACION;
      const disponibilidad = +( (mtbf / (mtbf + mttr)) * 100 ).toFixed(2);

      let estado: 'OPTIMA' | 'MONITOREO' | 'CRITICA' = 'OPTIMA';
      if (disponibilidad < 92) estado = 'CRITICA';
      else if (disponibilidad < 97) estado = 'MONITOREO';

      resultado.push({
        linea: g.linea,
        equipo: g.equipo,
        totalFallas: g.fallas,
        horasTotalesParo: horasParo,
        mttrHoras: mttr,
        mtbfHoras: mtbf,
        disponibilidadPct: disponibilidad,
        estadoConfiabilidad: estado,
      });
    }

    return resultado.sort((a, b) => a.disponibilidadPct - b.disponibilidadPct);
  }
}
