import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PrediccionRiesgoEquipo } from '../../core/models/models';

@Component({
  selector: 'app-predictivo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './predictivo.component.html',
  styleUrls: ['./predictivo.component.css'],
})
export class PredictivoComponent implements OnInit {
  equipos: PrediccionRiesgoEquipo[] = [];
  equiposFiltrados: PrediccionRiesgoEquipo[] = [];
  lineaSeleccionada = 'TODAS';
  cargando = true;
  ejecutandoInferencia = false;
  mensajeInferencia = '';

  // KPIs
  totalCriticos = 0;
  totalMedios = 0;
  totalBajos = 0;

  // Modal
  modalVisible = false;
  equipoSeleccionado: PrediccionRiesgoEquipo | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarPredicciones();
  }

  cargarPredicciones(): void {
    this.cargando = true;
    this.apiService.getPrediccionesRiesgo().subscribe({
      next: (data) => {
        this.equipos = data;
        this.calcularKpis();
        this.filtrarPorLinea(this.lineaSeleccionada);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  calcularKpis(): void {
    this.totalCriticos = this.equipos.filter((e) => e.nivelRiesgo === 'CRITICO').length;
    this.totalMedios = this.equipos.filter((e) => e.nivelRiesgo === 'MEDIO').length;
    this.totalBajos = this.equipos.filter((e) => e.nivelRiesgo === 'BAJO').length;
  }

  filtrarPorLinea(linea: string): void {
    this.lineaSeleccionada = linea;
    if (linea === 'TODAS') {
      this.equiposFiltrados = [...this.equipos];
    } else {
      this.equiposFiltrados = this.equipos.filter((e) => e.linea === linea);
    }
  }

  abrirDetalle(equipo: PrediccionRiesgoEquipo): void {
    this.equipoSeleccionado = equipo;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.equipoSeleccionado = null;
  }

  dispararPipeline(): void {
    this.ejecutandoInferencia = true;
    this.mensajeInferencia = 'Entrenando y ejecutando Random Forest Classifier...';
    this.apiService.ejecutarPipelineAI().subscribe({
      next: (res) => {
        this.ejecutandoInferencia = false;
        this.mensajeInferencia = `✅ ${res.mensaje} (${res.duracionMs} ms)`;
        this.cargarPredicciones();
      },
      error: (err) => {
        this.ejecutandoInferencia = false;
        this.mensajeInferencia = `⚠️ Error al ejecutar pipeline: ${err.message}`;
      },
    });
  }
}
