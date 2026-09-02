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

export interface ConfiabilidadEquipo {
  linea: string;
  equipo: string;
  totalFallas: number;
  horasTotalesParo: number;
  mttrHoras: number;
  mtbfHoras: number;
  disponibilidadPct: number;
  estadoConfiabilidad: 'OPTIMA' | 'MONITOREO' | 'CRITICA';
}

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

export interface CreateCorrectivoDto {
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
  estado?: string;
}

export interface ImpactoEconomico {
  Costo_Politica_Reactiva_USD: number;
  Costo_Preventivo_Calendario_USD: number;
  Costo_CeroFallas_AI_USD: number;
  Ahorro_Economico_Estimado_USD: number;
  Porcentaje_Ahorro_Operativo: number;
}
