import { parseVoiceCommand, formatIntentSummary } from '../../services/voiceParser';
import type { ParsedIntent } from '../../services/voiceParser';

describe('parseVoiceCommand', () => {
  it('parses "Add 10 kg clay"', () => {
    const result = parseVoiceCommand('Add 10 kg clay');
    expect(result.action).toBe('add');
    expect(result.quantity).toBe(10);
    expect(result.unit).toBe('kg');
    expect(result.item).toBe('clay');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('parses "Add 20 kilograms of red clay"', () => {
    const result = parseVoiceCommand('Add 20 kilograms of red clay');
    expect(result.action).toBe('add');
    expect(result.quantity).toBe(20);
    expect(result.unit).toBe('kg');
    expect(result.item).toBe('clay');
  });

  it('parses "Sell 5 pieces pottery"', () => {
    const result = parseVoiceCommand('Sell 5 pieces pottery');
    expect(result.action).toBe('sale');
    expect(result.quantity).toBe(5);
    expect(result.unit).toBe('pieces');
    expect(result.item).toBe('clay');
  });

  it('parses "Remove 3 liters glaze"', () => {
    const result = parseVoiceCommand('Remove 3 liters glaze');
    expect(result.action).toBe('remove');
    expect(result.quantity).toBe(3);
    expect(result.unit).toBe('liters');
    expect(result.item).toBe('glaze');
  });

  it('parses "How much cotton do I have"', () => {
    const result = parseVoiceCommand('How much cotton do I have');
    expect(result.action).toBe('check');
    expect(result.item).toBe('textile');
  });

  it('parses "Show my inventory"', () => {
    const result = parseVoiceCommand('Show my inventory');
    expect(result.action).toBe('list');
  });

  it('parses "Add 50 rupees worth of dye"', () => {
    const result = parseVoiceCommand('Add 50 rupees worth of dye');
    expect(result.action).toBe('add');
    expect(result.amount).toBe(50);
    expect(result.item).toBe('dye');
  });

  it('parses number words "Add five kg wood"', () => {
    const result = parseVoiceCommand('Add five kg wood');
    expect(result.action).toBe('add');
    expect(result.quantity).toBe(5);
    expect(result.unit).toBe('kg');
    expect(result.item).toBe('wood');
  });

  it('parses "Set reorder alert at 20 kilograms"', () => {
    const result = parseVoiceCommand('Set reorder alert at 20 kilograms');
    expect(result.action).toBe('set_reorder');
    expect(result.quantity).toBe(20);
    expect(result.unit).toBe('kg');
  });

  it('parses "Got 100 grams metal"', () => {
    const result = parseVoiceCommand('Got 100 grams metal');
    expect(result.action).toBe('add');
    expect(result.quantity).toBe(100);
    expect(result.unit).toBe('grams');
    expect(result.item).toBe('metal');
  });

  it('handles empty input gracefully', () => {
    const result = parseVoiceCommand('');
    expect(result.action).toBe('add');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('handles unrecognized text', () => {
    const result = parseVoiceCommand('hello world test');
    expect(result.action).toBe('add');
    expect(result.confidence).toBeLessThan(0.6);
  });
});

describe('formatIntentSummary', () => {
  it('formats a complete intent', () => {
    const intent: ParsedIntent = {
      action: 'add',
      quantity: 10,
      unit: 'kg',
      item: 'clay',
      confidence: 0.9,
      raw: 'Add 10 kg clay',
    };
    const summary = formatIntentSummary(intent);
    expect(summary).toContain('ADD');
    expect(summary).toContain('10 kg');
    expect(summary).toContain('clay');
    expect(summary).toContain('90%');
  });

  it('formats intent without unit', () => {
    const intent: ParsedIntent = {
      action: 'check',
      quantity: 5,
      item: 'wood',
      confidence: 0.7,
      raw: 'check 5 wood',
    };
    const summary = formatIntentSummary(intent);
    expect(summary).toContain('CHECK');
    expect(summary).toContain('5');
    expect(summary).toContain('wood');
  });

  it('formats intent with amount', () => {
    const intent: ParsedIntent = {
      action: 'sale',
      quantity: 3,
      unit: 'pieces',
      item: 'clay',
      amount: 500,
      confidence: 0.85,
      raw: 'sell 3 pieces clay for 500 rupees',
    };
    const summary = formatIntentSummary(intent);
    expect(summary).toContain('SALE');
    expect(summary).toContain('₹500');
  });
});
