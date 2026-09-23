import { describe, expect, it } from 'vitest';
import { canTransitionStatus, shouldSkipStatusUpdate } from './statusTransitions';

describe('statusTransitions', () => {
  it('ignora mudança quando o status enviado é igual ao atual', () => {
    expect(shouldSkipStatusUpdate('PENDENTE', 'PENDENTE')).toBe(true);
    expect(shouldSkipStatusUpdate('pendente', 'PENDENTE')).toBe(true);
  });

  it('permite transições válidas do status pendente', () => {
    expect(canTransitionStatus('PENDENTE', 'ATENDIDO')).toBe(true);
    expect(canTransitionStatus('PENDENTE', 'CANCELADO')).toBe(true);
    expect(canTransitionStatus('PENDENTE', 'FALTOU')).toBe(true);
  });

  it('rejeita a transição pendente -> pendente', () => {
    expect(canTransitionStatus('PENDENTE', 'PENDENTE')).toBe(false);
  });

  it('rejeita transições inválidas de acordo com o contrato', () => {
    expect(canTransitionStatus('ATENDIDO', 'PENDENTE')).toBe(false);
    expect(canTransitionStatus('FALTOU', 'ATENDIDO')).toBe(false);
    expect(canTransitionStatus('CANCELADO', 'PENDENTE')).toBe(false);
  });
});
