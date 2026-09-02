import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CreateCorrectivoDto } from '../../core/models/models';

@Component({
  selector: 'app-correctivos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './correctivos.component.html',
  styleUrls: ['./correctivos.component.css'],
})
export class CorrectivosComponent {
  nuevoRegistro: CreateCorrectivoDto = {
    linea: 'LINEA_1',
    equipo: 'BATIDORA',
    fecha: new Date().toISOString().split('T')[0],
    nombre: '',
    turno: '1',
    falla: 'FALLA BATIDORA',
    descripcion: '',
    horaInicio: '',
    horaFinal: '',
    minutos: 0,
    estado: 'FINALIZADO',
  };

  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  equiposList = [
    'BATIDORA',
    'SILO',
    'SUPERMIX',
    'EXEL',
    'PRENSA',
    'FILTRACION',
    'COMPRESOR',
    'ENVASADORA',
    'BOMBA_ABASTECIMIENTO',
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  calcularMinutos(): void {
    if (this.nuevoRegistro.horaInicio && this.nuevoRegistro.horaFinal) {
      const inicio = new Date(this.nuevoRegistro.horaInicio).getTime();
      const fin = new Date(this.nuevoRegistro.horaFinal).getTime();
      const diffMin = Math.round((fin - inicio) / 60000);
      if (diffMin < 0) {
        this.mensajeError = 'La hora final no puede ser menor a la inicial';
        this.nuevoRegistro.minutos = 0;
      } else {
        this.mensajeError = '';
        this.nuevoRegistro.minutos = diffMin;
      }
    }
  }

  onEquipoChange(): void {
    this.nuevoRegistro.falla = `FALLA ${this.nuevoRegistro.equipo}`;
  }

  guardar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nuevoRegistro.nombre.trim()) {
      this.mensajeError = 'Debe ingresar el nombre del técnico responsable.';
      return;
    }

    if (this.nuevoRegistro.descripcion.length < 10) {
      this.mensajeError = 'La descripción de la intervención debe tener mínimo 10 caracteres.';
      return;
    }

    if (!this.nuevoRegistro.horaInicio || !this.nuevoRegistro.horaFinal) {
      this.mensajeError = 'Debe registrar la hora de inicio y finalización del paro.';
      return;
    }

    this.guardando = true;
    this.apiService.createCorrectivo(this.nuevoRegistro).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = '✅ Registro de tiempo muerto guardado exitosamente.';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = `Error al guardar: ${err.message}`;
      },
    });
  }
}
