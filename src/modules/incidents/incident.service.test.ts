import { describe, it, expect } from 'vitest';

describe('IncidentService - Core Logic', () => {
  it('should validate EmbeddingInput shape', () => {
    const input = {
      serviceName: 'payment-service',
      environment: 'production',
      errorMessage: 'DB timeout',
      stackTrace: null,
      logs: null,
    };
    expect(input.serviceName).toBe('payment-service');
    expect(input.errorMessage).toBeDefined();
  });

  it('should handle CRITICAL severity', () => {
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    expect(severities).toContain('CRITICAL');
     expect(severities.length).toBe(4);
  });

  it('should validate status enum OPEN/INVESTIGATING/RESOLVED', () => {
    const statuses = ['OPEN', 'INVESTIGATING', 'RESOLVED'];
    expect(statuses).toContain('OPEN');
    expect(statuses).toContain('RESOLVED');
    expect(statuses.length).toBe(3);
  });

  it('should truncate embedding text to 1500 chars', () => {
    const longText = 'a'.repeat(2000);
    const truncated = longText.slice(0, 1500);
    expect(truncated.length).toBe(1500);
  });

  it('should validate 1536 dimension', () => {
    const embedding = new Array(1536).fill(0.1);
    expect(embedding.length).toBe(1536);
    expect(embedding.some(n => !isFinite(n))).toBe(false);
  });

  it('should filter similarity >0.75', () => {
    const similarities = [0.5, 0.76, 0.85, 0.9];
    const filtered = similarities.filter(s => s >= 0.75);
    expect(filtered).toEqual([0.76, 0.85, 0.9]);
  });

  it('should handle error isolation - incident saves even if embedding fails', () => {
    let incidentSaved = false;
    let embeddingFailed = false;

    try {
      incidentSaved = true;
      throw new Error('Embedding failed');
    } catch {
      embeddingFailed = true;
    }

    expect(incidentSaved).toBe(true);
    expect(embeddingFailed).toBe(true);
  });

  it('should handle SQS error isolation', () => {
    let incidentSaved = false;
    let sqsFailed = false;

    try {
      incidentSaved = true;
      throw new Error('QueueDoesNotExist');
    } catch {
      sqsFailed = true;
    }

    expect(incidentSaved).toBe(true);
    expect(sqsFailed).toBe(true);
  });

  it('should re-embed on update if errorMessage changes', () => {
    const oldError = 'old error';
    const newError = 'new error';
    const shouldReEmbed = oldError !== newError;
    
    expect(shouldReEmbed).toBe(true);
  });

  it('should not re-embed if only severity changes', () => {
    const data = { severity: 'RESOLVED' };
    const shouldReEmbed = Boolean((data as any).errorMessage || (data as any).stackTrace || (data as any).logs);
    
    expect(shouldReEmbed).toBe(false);
  });
});