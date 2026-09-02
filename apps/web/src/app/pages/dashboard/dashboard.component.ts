import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PrediccionRiesgoEquipo } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  equiposCriticos = 0;
  equiposMedios = 0;
  equiposNormales = 0;
  ahorroEstimado = 77.16;
  disponibilidadGlobal = 98.4;
  cargando = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.apiService.getPrediccionesRiesgo().subscribe({
      next: (equipos) => {
        this.equiposCriticos = equipos.filter((e) => e.nivelRiesgo === 'CRITICO').length;
        this.equiposMedios = equipos.filter((e) => e.nivelRiesgo === 'MEDIO').length;
        this.equiposNormales = equipos.filter((e) => e.nivelRiesgo === 'BAJO').length;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });

    this.apiService.getImpactoEconomico().subscribe({
      next: (res) => {
        if (res?.Porcentaje_Ahorro_Operativo) {
          this.ahorroEstimado = res.Porcentaje_Ahorro_Operativo;
        }
      },
    });
  }
}
