import { Injectable } from '@nestjs/common';
import { CreateCorrectivoDto } from './dto/create-correctivo.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface CorrectivoRecord {
  id: string;
  linea: string;
  equipo: string;
  fecha: string;
  nombre: string;
  turno: string;
  falla: string;
  descripcion: string;
  horaInicio: string;
  horaFinal: string;
  minutos: number;
  estado: string;
  createdAt: string;
}

@Injectable()
export class CorrectivosService {
  private correctivos: CorrectivoRecord[] = [];
  private readonly dataFilePath = path.resolve(__dirname, '../../../CeroFallasAI/data/clean_correctivos.csv');

  constructor() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const contenido = fs.readFileSync(this.dataFilePath, 'utf-8');
        const lineas = contenido.split('\n').filter((l) => l.trim().length > 0);
        if (lineas.length > 1) {
          for (let i = 1; i < lineas.length; i++) {
            const cols = lineas[i].split(',');
            if (cols.length >= 8) {
              this.correctivos.push({
                id: cols[0] || `corr-${i}`,
                linea: cols[2] || 'LINEA_1',
                equipo: cols[3] || 'GENERAL',
                fecha: cols[4] || new Date().toISOString(),
                turno: cols[5] || '1',
                falla: cols[6] || 'FALLA GENERAL',
                descripcion: cols[7] || 'Sin descripción',
                minutos: parseFloat(cols[8]) || 0,
                nombre: cols[9] || 'Técnico',
                horaInicio: '08:00',
                horaFinal: '09:00',
                estado: 'FINALIZADO',
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('[CorrectivosService] Error leyendo archivo inicial:', e?.message || e);
    }
  }

  findAll(): CorrectivoRecord[] {
    return this.correctivos;
  }

  findByLinea(linea: string): CorrectivoRecord[] {
    return this.correctivos.filter((c) => c.linea.toUpperCase() === linea.toUpperCase());
  }

  create(dto: CreateCorrectivoDto): CorrectivoRecord {
    let duracionMinutos = dto.minutos;
    if (!duracionMinutos && dto.horaInicio && dto.horaFinal) {
      const inicio = new Date(dto.horaInicio).getTime();
      const fin = new Date(dto.horaFinal).getTime();
      duracionMinutos = Math.max(0, Math.round((fin - inicio) / 60000));
    }

    const nuevo: CorrectivoRecord = {
      ...dto,
      minutos: duracionMinutos,
      estado: dto.estado || 'FINALIZADO',
      id: `corr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    this.correctivos.unshift(nuevo);
    return nuevo;
  }
}
