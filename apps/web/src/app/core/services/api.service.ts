import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PrediccionRiesgoEquipo,
  ConfiabilidadEquipo,
  CorrectivoRecord,
  CreateCorrectivoDto,
  ImpactoEconomico,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Predictivo AI
  getPrediccionesRiesgo(): Observable<PrediccionRiesgoEquipo[]> {
    return this.http.get<PrediccionRiesgoEquipo[]>(`${this.baseUrl}/predictivo/riesgo-equipos`);
  }

  getImpactoEconomico(): Observable<ImpactoEconomico> {
    return this.http.get<ImpactoEconomico>(`${this.baseUrl}/predictivo/impacto-economico`);
  }

  getMetricasModelos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/predictivo/modelos-metricas`);
  }

  ejecutarPipelineAI(): Observable<{ status: string; mensaje: string; duracionMs: number }> {
    return this.http.post<{ status: string; mensaje: string; duracionMs: number }>(
      `${this.baseUrl}/predictivo/ejecutar-pipeline`,
      {},
    );
  }

  // Confiabilidad
  getKpisConfiabilidad(): Observable<ConfiabilidadEquipo[]> {
    return this.http.get<ConfiabilidadEquipo[]>(`${this.baseUrl}/confiabilidad/kpis`);
  }

  // Correctivos
  getCorrectivos(): Observable<CorrectivoRecord[]> {
    return this.http.get<CorrectivoRecord[]>(`${this.baseUrl}/correctivos`);
  }

  getCorrectivosByLinea(linea: string): Observable<CorrectivoRecord[]> {
    return this.http.get<CorrectivoRecord[]>(`${this.baseUrl}/correctivos/linea/${linea}`);
  }

  createCorrectivo(dto: CreateCorrectivoDto): Observable<CorrectivoRecord> {
    return this.http.post<CorrectivoRecord>(`${this.baseUrl}/correctivos`, dto);
  }
}
