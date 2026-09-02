import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ConfiabilidadEquipo } from '../../core/models/models';

@Component({
  selector: 'app-confiabilidad',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confiabilidad.component.html',
  styleUrls: ['./confiabilidad.component.css'],
})
export class ConfiabilidadComponent implements OnInit {
  kpis: ConfiabilidadEquipo[] = [];
  kpisFiltrados: ConfiabilidadEquipo[] = [];
  lineaSeleccionada = 'TODAS';
  cargando = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarKpis();
  }

  cargarKpis(): void {
    this.cargando = true;
    this.apiService.getKpisConfiabilidad().subscribe({
      next: (data) => {
        this.kpis = data;
        this.filtrarPorLinea(this.lineaSeleccionada);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }

  filtrarPorLinea(linea: string): void {
    this.lineaSeleccionada = linea;
    if (linea === 'TODAS') {
      this.kpisFiltrados = [...this.kpis];
    } else {
      this.kpisFiltrados = this.kpis.filter((k) => k.linea === linea);
    }
  }
}
