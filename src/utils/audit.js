export const auditActionLabels = {
  create: 'Creó el registro',
  update: 'Actualizó el registro',
  void: 'Anuló el registro',
  disable: 'Desactivó el registro',
  reschedule: 'Reprogramó el plan automáticamente',
  reschedule_reverted: 'Revirtió la reprogramación del plan',
  password_reset_requested: 'Solicitó restablecer la contraseña',
  password_reset: 'Restableció la contraseña',
  password_reset_failed: 'Falló el restablecimiento de contraseña',
  release_session: 'Liberó la sesión de otro dispositivo',
}

export const auditEntityLabels = {
  user: 'Usuario',
  equipment: 'Equipo',
  corrective: 'Mantenimiento correctivo',
  preventivePlan: 'Plan preventivo',
  preventiveExecution: 'Ejecución preventiva',
  forkliftInspection: 'Inspección de montacargas',
  incident: 'Incidente',
  activeSession: 'Sesión de usuario',
}

export function auditActionLabel(action) {
  return auditActionLabels[action] || `Acción: ${action || 'no identificada'}`
}

export function auditEntityLabel(entityType) {
  return auditEntityLabels[entityType] || `Entidad: ${entityType || 'no identificada'}`
}

export function auditActorLabel(actorId, actors = new Map()) {
  const actor = actors.get(actorId)
  const identity = actor?.displayName || actor?.email
  return identity ? `${identity} · ${actorId}` : actorId || 'Usuario no identificado'
}
