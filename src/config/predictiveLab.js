export const predictiveLabSnapshot = Object.freeze({
  status: 'demonstration_only',
  generatedOn: '2026-09-05',
  dataset: {
    origin: 'Sintético y reproducible',
    rows: 1200,
    trainingRows: 960,
    testRows: 240,
    targetRate: 31.67,
    fingerprint: '20E57B89D7A719064',
  },
  models: [
    {
      id: 'logistic_regression',
      name: 'Regresión logística',
      purpose: 'Línea base explicable',
      prAuc: 47.37,
      recall: 61.33,
      selected: false,
    },
    {
      id: 'random_forest',
      name: 'Bosque aleatorio',
      purpose: 'Segundo modelo candidato',
      prAuc: 48.02,
      recall: 50.67,
      selected: true,
    },
  ],
  stages: [
    { label: 'Contrato de datos', detail: 'Campos, objetivo y reglas de calidad definidos.', state: 'complete' },
    { label: 'Laboratorio reproducible', detail: 'Generación, entrenamiento y comparación automatizados.', state: 'complete' },
    { label: 'Histórico autorizado', detail: 'Pendiente recopilar fallas y condiciones reales de planta.', state: 'pending' },
    { label: 'Validación operativa', detail: 'Pendiente acordar umbral, piloto y revisión con mantenimiento.', state: 'pending' },
  ],
})
