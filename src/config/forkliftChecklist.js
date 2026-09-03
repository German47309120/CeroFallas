export const forkliftChecklistTemplate = {
  id: 'forklift-daily-v1',
  name: 'Inspección diaria de montacargas',
  version: 1,
  sections: [
    { title: 'Identificación e inspección visual', items: [
      { id: 'data-plate', label: 'Placa de identificación y capacidad legibles', critical: false },
      { id: 'tires', label: 'Llantas sin cortes, desgaste excesivo ni presión anormal', critical: true },
      { id: 'forks', label: 'Horquillas sin grietas, deformación ni desgaste crítico', critical: true },
      { id: 'mast-chains', label: 'Mástil, cadenas y rodillos en condición segura', critical: true },
      { id: 'hoses', label: 'Mangueras y conexiones sin fugas ni daño', critical: true },
      { id: 'cylinders', label: 'Cilindros hidráulicos sin fugas o daño visible', critical: true },
      { id: 'general-leaks', label: 'Ausencia de fugas bajo el equipo', critical: true },
    ] },
    { title: 'Niveles y energía', items: [
      { id: 'engine-oil', label: 'Nivel de aceite de motor', critical: false },
      { id: 'hydraulic-oil', label: 'Nivel de aceite hidráulico', critical: true },
      { id: 'coolant', label: 'Nivel de refrigerante', critical: true },
      { id: 'fuel-battery', label: 'Combustible, batería o carga suficiente', critical: false },
      { id: 'battery-connections', label: 'Bornes, cables o conector de batería seguros', critical: true },
    ] },
    { title: 'Operación', items: [
      { id: 'service-brake', label: 'Freno de servicio responde correctamente', critical: true },
      { id: 'parking-brake', label: 'Freno de estacionamiento sostiene el equipo', critical: true },
      { id: 'steering', label: 'Dirección sin juego ni respuesta anormal', critical: true },
      { id: 'lift-lower', label: 'Elevación y descenso funcionan suavemente', critical: true },
      { id: 'tilt', label: 'Inclinación del mástil funciona correctamente', critical: true },
      { id: 'horn', label: 'Bocina operativa', critical: true },
      { id: 'lights-alarm', label: 'Luces, baliza y alarma de reversa operativas', critical: true },
      { id: 'instruments', label: 'Tablero e indicadores sin alarmas activas', critical: false },
    ] },
    { title: 'Seguridad', items: [
      { id: 'seatbelt', label: 'Cinturón de seguridad funcional', critical: true },
      { id: 'seat', label: 'Asiento y ajuste en buen estado', critical: false },
      { id: 'overhead-guard', label: 'Techo protector sin daño estructural', critical: true },
      { id: 'load-backrest', label: 'Respaldo de carga instalado y seguro', critical: true },
      { id: 'extinguisher', label: 'Extintor presente y vigente cuando aplique', critical: false },
    ] },
  ],
}

export const checklistAnswerOptions = [
  { value: 'good', label: 'Bueno' },
  { value: 'attention_required', label: 'Requiere atención' },
  { value: 'out_of_service', label: 'Fuera de servicio' },
  { value: 'not_applicable', label: 'No aplica' },
]

export const operationalShifts = [
  { id: 'shift-1', name: 'Turno 1 · 06:00–18:00' },
  { id: 'shift-2', name: 'Turno 2 · 18:00–06:00' },
]
