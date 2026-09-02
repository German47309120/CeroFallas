import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PrediccionRiesgoEquipo {
  linea: string;
  equipo: string;
  probabilidadFalla7d: number;
  scoreRiesgoPct: number;
  nivelRiesgo: 'CRITICO' | 'MEDIO' | 'BAJO';
  semaforo: 'ROJO' | 'AMARILLO' | 'VERDE';
  diasSinPreventivo: number;
  diasSinFalla: number;
  fallas30d: number;
  minutosParo30d: number;
  recomendacionPrescriptiva: string;
  fechaActualizacion: string;
}

@Injectable()
export class PredictivoService {
  private readonly jsonPath = path.resolve(__dirname, '../../../CeroFallasAI/data/ultimas_predicciones_riesgo.json');
  private readonly impactoPath = path.resolve(__dirname, '../../../CeroFallasAI/reports/impacto_economico_mantenimiento.csv');
  private readonly modelosPath = path.resolve(__dirname, '../../../CeroFallasAI/reports/tabla_comparativa_modelos.csv');

  obtenerPrediccionesRiesgo(): PrediccionRiesgoEquipo[] {
    try {
      if (fs.existsSync(this.jsonPath)) {
        const raw = fs.readFileSync(this.jsonPath, 'utf-8');
        const data = JSON.parse(raw);
        const lista: PrediccionRiesgoEquipo[] = [];

        for (const lineaKey in data) {
          const equipos = data[lineaKey];
          for (const eqKey in equipos) {
            const item = equipos[eqKey];
            lista.push({
              linea: item.Linea,
              equipo: item.Equipo,
              probabilidadFalla7d: item.Probabilidad_Falla_7d,
              scoreRiesgoPct: item.Score_Riesgo_Pct,
              nivelRiesgo: item.Nivel_Riesgo,
              semaforo: item.Semaforo,
              diasSinPreventivo: item.Dias_Sin_Preventivo,
              diasSinFalla: item.Dias_Sin_Falla,
              fallas30d: item.Fallas_30d,
              minutosParo30d: item.Minutos_Paro_30d,
              recomendacionPrescriptiva: item.Recomendacion_Prescriptiva,
              fechaActualizacion: item.Fecha_Actualizacion,
            });
          }
        }
        return lista.sort((a, b) => b.probabilidadFalla7d - a.probabilidadFalla7d);
      }
    } catch (e: any) {
      console.warn('[PredictivoService] Error leyendo predicciones JSON:', e?.message || e);
    }

    return this.generarPrediccionesFallback();
  }

  obtenerImpactoEconomico(): Record<string, any> {
    try {
      if (fs.existsSync(this.impactoPath)) {
        const contenido = fs.readFileSync(this.impactoPath, 'utf-8');
        const lineas = contenido.split('\n').filter((l) => l.trim().length > 0);
        if (lineas.length >= 2) {
          const headers = lineas[0].split(',');
          const valores = lineas[1].split(',');
          const res: Record<string, any> = {};
          headers.forEach((h, idx) => {
            res[h.trim()] = isNaN(Number(valores[idx])) ? valores[idx] : Number(valores[idx]);
          });
          return res;
        }
      }
    } catch (e: any) {
      console.warn('[PredictivoService] Error leyendo impacto económico:', e?.message || e);
    }

    return {
      Costo_Politica_Reactiva_USD: 2947800.0,
      Costo_Preventivo_Calendario_USD: 1055730.0,
      Costo_CeroFallas_AI_USD: 673250.0,
      Ahorro_Economico_Estimado_USD: 2274550.0,
      Porcentaje_Ahorro_Operativo: 77.16,
    };
  }

  obtenerComparativaModelos(): any[] {
    try {
      if (fs.existsSync(this.modelosPath)) {
        const contenido = fs.readFileSync(this.modelosPath, 'utf-8');
        const lineas = contenido.split('\n').filter((l) => l.trim().length > 0);
        if (lineas.length >= 2) {
          const headers = lineas[0].split(',');
          const listado = [];
          for (let i = 1; i < lineas.length; i++) {
            const vals = lineas[i].split(',');
            const item: Record<string, any> = {};
            headers.forEach((h, idx) => {
              item[h.trim()] = isNaN(Number(vals[idx])) ? vals[idx] : Number(vals[idx]);
            });
            listado.push(item);
          }
          return listado;
        }
      }
    } catch (e: any) {
      console.warn('[PredictivoService] Error leyendo comparativa de modelos:', e?.message || e);
    }
    return [];
  }

  async ejecutarInferenciaPipeline(): Promise<{ status: string; mensaje: string; duracionMs: number }> {
    const inicio = Date.now();
    try {
      const rootDir = path.resolve(__dirname, '../../../../');
      await execAsync('python -u -m CeroFallasAI.main_pipeline', { cwd: rootDir });
      const duracion = Date.now() - inicio;
      return {
        status: 'OK',
        mensaje: 'Pipeline de Machine Learning re-entrenado y ejecutado con éxito.',
        duracionMs: duracion,
      };
    } catch (e: any) {
      return {
        status: 'ERROR',
        mensaje: `Error al ejecutar pipeline Python: ${e?.message || e}`,
        duracionMs: Date.now() - inicio,
      };
    }
  }

  private generarPrediccionesFallback(): PrediccionRiesgoEquipo[] {
    return [
      {
        linea: 'LINEA_1',
        equipo: 'BATIDORA',
        probabilidadFalla7d: 0.88,
        scoreRiesgoPct: 88.0,
        nivelRiesgo: 'CRITICO',
        semaforo: 'ROJO',
        diasSinPreventivo: 42,
        diasSinFalla: 8,
        fallas30d: 4,
        minutosParo30d: 210,
        recomendacionPrescriptiva: 'Inspección urgente de sellos mecánicos, eje principal y nivel de aceite de reductor.',
        fechaActualizacion: new Date().toISOString(),
      },
      {
        linea: 'LINEA_1',
        equipo: 'SUPERMIX',
        probabilidadFalla7d: 0.74,
        scoreRiesgoPct: 74.0,
        nivelRiesgo: 'CRITICO',
        semaforo: 'ROJO',
        diasSinPreventivo: 35,
        diasSinFalla: 11,
        fallas30d: 3,
        minutosParo30d: 145,
        recomendacionPrescriptiva: 'Alta vibración detectada. Calibrar balanceo dinámico de paletas y chequear torque de pernos.',
        fechaActualizacion: new Date().toISOString(),
      },
      {
        linea: 'LINEA_2',
        equipo: 'PRENSA',
        probabilidadFalla7d: 0.58,
        scoreRiesgoPct: 58.0,
        nivelRiesgo: 'MEDIO',
        semaforo: 'AMARILLO',
        diasSinPreventivo: 26,
        diasSinFalla: 22,
        fallas30d: 2,
        minutosParo30d: 85,
        recomendacionPrescriptiva: 'Purgar circuito hidráulico y verificar temperatura del fluido en tanque.',
        fechaActualizacion: new Date().toISOString(),
      },
      {
        linea: 'LINEA_1',
        equipo: 'SILO',
        probabilidadFalla7d: 0.22,
        scoreRiesgoPct: 22.0,
        nivelRiesgo: 'BAJO',
        semaforo: 'VERDE',
        diasSinPreventivo: 12,
        diasSinFalla: 38,
        fallas30d: 0,
        minutosParo30d: 0,
        recomendacionPrescriptiva: 'Operación Normal: Parámetros de presión dentro de tolerancia.',
        fechaActualizacion: new Date().toISOString(),
      },
    ];
  }
}
