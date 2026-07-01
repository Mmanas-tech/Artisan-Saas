export type ActionType = 'add' | 'remove' | 'sale' | 'check' | 'list' | 'set_reorder';
export type UnitType = 'kg' | 'pieces' | 'liters' | 'meters' | 'grams';

export interface ParsedIntent {
  action: ActionType;
  quantity?: number;
  unit?: UnitType;
  item?: string;
  amount?: number;
  confidence: number;
  raw: string;
}

const ACTION_KEYWORDS: Record<string, ActionType> = {
  add: 'add',
  put: 'add',
  stock: 'add',
  received: 'add',
  got: 'add',
  new: 'add',
  remove: 'remove',
  delete: 'remove',
  discard: 'remove',
  sell: 'sale',
  sale: 'sale',
  sold: 'sale',
  check: 'check',
  how: 'check',
  what: 'check',
  show: 'list',
  list: 'list',
  set: 'set_reorder',
  reorder: 'set_reorder',
  alert: 'set_reorder',
};

const ITEM_MAP: Record<string, string> = {
  clay: 'clay',
  pot: 'clay',
  pottery: 'clay',
  ceramic: 'clay',
  red: 'clay',
  white: 'clay',
  textile: 'textile',
  cloth: 'textile',
  fabric: 'textile',
  cotton: 'textile',
  silk: 'textile',
  yarn: 'textile',
  thread: 'textile',
  indigo: 'textile',
  wood: 'wood',
  timber: 'wood',
  teak: 'wood',
  sandalwood: 'wood',
  metal: 'metal',
  brass: 'metal',
  copper: 'metal',
  tin: 'metal',
  iron: 'metal',
  glaze: 'glaze',
  dye: 'dye',
  color: 'dye',
  paint: 'dye',
  rice: 'rice',
  wheat: 'wheat',
  flour: 'flour',
  sugar: 'sugar',
  oil: 'oil',
};

const UNIT_MAP: Record<string, UnitType> = {
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  grams: 'grams',
  gram: 'grams',
  g: 'grams',
  liters: 'liters',
  liter: 'liters',
  l: 'liters',
  litre: 'liters',
  metres: 'meters',
  meters: 'meters',
  meter: 'meters',
  m: 'meters',
  metre: 'meters',
  pieces: 'pieces',
  piece: 'pieces',
  pcs: 'pieces',
  items: 'pieces',
  unit: 'pieces',
  units: 'pieces',
};

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50,
};

function extractNumber(text: string): number | undefined {
  const numMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (numMatch) return parseFloat(numMatch[1]);

  const words = text.toLowerCase().split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const val = NUMBER_WORDS[word];
    if (val !== undefined) {
      if (val === 100) {
        current = current === 0 ? 100 : current * 100;
      } else if (val >= 20) {
        current += val;
      } else {
        current += val;
      }
    }
  }

  total += current;
  return total > 0 ? total : undefined;
}

function detectAction(words: string[]): ActionType {
  for (const word of words) {
    const action = ACTION_KEYWORDS[word.toLowerCase()];
    if (action) return action;
  }
  return 'add';
}

function detectItem(words: string[]): string | undefined {
  for (const word of words) {
    const item = ITEM_MAP[word.toLowerCase()];
    if (item) return item;
  }
  return undefined;
}

function detectUnit(words: string[]): UnitType | undefined {
  for (const word of words) {
    const unit = UNIT_MAP[word.toLowerCase()];
    if (unit) return unit;
  }
  return undefined;
}

function detectAmount(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(?:rupees?|rs\.?|inr)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

export function parseVoiceCommand(transcript: string): ParsedIntent {
  const lower = transcript.toLowerCase().trim();
  const words = lower.split(/\s+/);

  const action = detectAction(words);
  const quantity = extractNumber(lower);
  const unit = detectUnit(words);
  const item = detectItem(words);
  const amount = detectAmount(lower);

  let confidence = 0.4;

  if (action !== 'add') confidence += 0.2;
  if (quantity !== undefined) confidence += 0.15;
  if (unit !== undefined) confidence += 0.1;
  if (item !== undefined) confidence += 0.15;
  if (amount !== undefined) confidence += 0.05;

  confidence = Math.min(confidence, 0.99);

  return {
    action,
    quantity,
    unit,
    item,
    amount,
    confidence,
    raw: transcript,
  };
}

export function formatIntentSummary(intent: ParsedIntent): string {
  const parts: string[] = [];

  parts.push(`Action: ${intent.action.toUpperCase()}`);

  if (intent.quantity !== undefined && intent.unit) {
    parts.push(`Quantity: ${intent.quantity} ${intent.unit}`);
  } else if (intent.quantity !== undefined) {
    parts.push(`Quantity: ${intent.quantity}`);
  }

  if (intent.item) {
    parts.push(`Item: ${intent.item}`);
  }

  if (intent.amount) {
    parts.push(`Amount: ₹${intent.amount}`);
  }

  parts.push(`Confidence: ${Math.round(intent.confidence * 100)}%`);

  return parts.join(' | ');
}
