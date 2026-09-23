export function canTransitionStatus(currentStatus, nextStatus) {
  const normalizedCurrent = String(currentStatus || '').toUpperCase();
  const normalizedNext = String(nextStatus || '').toUpperCase();

  if (!normalizedCurrent || !normalizedNext) return false;
  if (normalizedCurrent === normalizedNext) return false;

  const allowedTransitions = {
    PENDENTE: ['ATENDIDO', 'CANCELADO', 'FALTOU'],
    ATENDIDO: ['ATENDIDO', 'CANCELADO'],
    FALTOU: ['FALTOU', 'CANCELADO'],
    CANCELADO: ['CANCELADO'],
  };

  return allowedTransitions[normalizedCurrent]?.includes(normalizedNext) ?? false;
}

export function shouldSkipStatusUpdate(currentStatus, nextStatus) {
  return String(currentStatus || '').toUpperCase() === String(nextStatus || '').toUpperCase();
}
