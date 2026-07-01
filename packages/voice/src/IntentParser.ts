import type { VoiceCommand, TransactionType } from '@artisan/shared';

const LANGUAGE_MAPS: Record<string, Record<string, string>> = {
  hi: {
    'जोड़ें': 'add',
    'जोड़ो': 'add',
    'शामिल करें': 'add',
    'बेचें': 'sale',
    'बेचो': 'sale',
    'निकालें': 'remove',
    'निकालो': 'remove',
    'कितना': 'check',
    'जांचें': 'check',
    'दिखाओ': 'list',
    'सूची': 'list',
    'मिट्टी': 'clay',
    'कपड़ा': 'textile',
    'लकड़ी': 'wood',
    'धातु': 'metal',
    'रंग': 'color',
    'ग्लेज़': 'glaze',
    'धागा': 'thread',
    'किलोग्राम': 'kg',
    'किलो': 'kg',
    'ग्राम': 'grams',
    'लीटर': 'liters',
    'मीटर': 'meters',
    'टुकड़े': 'pieces',
    'पीस': 'pieces',
    'रुपये': 'rupees',
    'रुपया': 'rupees',
  },
  ta: {
    'சேர்': 'add',
    'விற்க': 'sale',
    'நீக்கு': 'remove',
    'எவ்வளவு': 'check',
    'பட்டியல்': 'list',
    'மண்': 'clay',
    'துணி': 'textile',
    'மரம்': 'wood',
    'உலோகம்': 'metal',
    'கிலோ': 'kg',
    'லிட்டர்': 'liters',
    'மீட்டர்': 'meters',
    'துண்டுகள்': 'pieces',
    'ரூபாய்': 'rupees',
  },
  kn: {
    'ಸೇರಿಸಿ': 'add',
    'ಮಾರಾಟ': 'sale',
    'ತೆಗೆದುಹಾಕಿ': 'remove',
    'ಎಷ್ಟು': 'check',
    'ಪಟ್ಟಿ': 'list',
    'ಮಣ್ಣು': 'clay',
    'ಬಟ್ಟೆ': 'textile',
 'ಮರ': 'wood',
    'ಲೋಹ': 'metal',
    'ಕಿಲೋ': 'kg',
    'ಲೀಟರ್': 'liters',
    'ಮೀಟರ್': 'meters',
    'ತುಂಡುಗಳು': 'pieces',
    'ರೂಪಾಯಿ': 'rupees',
  },
  te: {
    'చేర్చండి': 'add',
    'అమ్మండి': 'sale',
    'తొలగించండి': 'remove',
    'ఎంత': 'check',
    'జాబితా': 'list',
    'మట్టి': 'clay',
    'వస్త్రం': 'textile',
    'కలప': 'wood',
    'లోహం': 'metal',
    'కిలో': 'kg',
    'లీటర్': 'liters',
    'మీటర్': 'meters',
    'ముక్కలు': 'pieces',
    'రూపాయలు': 'rupees',
  },
};

const ACTION_KEYWORDS: Record<string, TransactionType | 'check' | 'list'> = {
  add: 'add',
  put: 'add',
  stock: 'add',
  received: 'add',
  sale: 'sale',
  sold: 'sale',
  sell: 'sale',
  remove: 'remove',
  remove: 'remove',
  check: 'check',
  how: 'check',
  list: 'list',
  show: 'list',
};

const ITEM_KEYWORDS: Record<string, string> = {
  clay: 'clay',
  pot: 'clay',
  pottery: 'clay',
  ceramic: 'clay',
  textile: 'textile',
  cloth: 'textile',
  fabric: 'textile',
  cotton: 'textile',
  silk: 'textile',
  yarn: 'textile',
  thread: 'textile',
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
  indigo: 'dye',
  paint: 'dye',
};

const UNIT_KEYWORDS: Record<string, string> = {
  kg: 'kg',
  kilogram: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  grams: 'grams',
  gram: 'grams',
  g: 'grams',
  liters: 'liters',
  liter: 'liters',
  l: 'liters',
  litre: 'liters',
  litres: 'liters',
  meters: 'meters',
  meter: 'meters',
  m: 'meters',
  metre: 'meters',
  metres: 'meters',
  pieces: 'pieces',
  piece: 'pieces',
  pcs: 'pieces',
  items: 'pieces',
  item: 'pieces',
};

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
  // Hindi numbers
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
    if (NUMBER_WORDS[word] !== undefined) {
      const val = NUMBER_WORDS[word];
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

function translateToEnglish(text: string, language: string): string {
  if (language === 'en') return text;

  const map = LANGUAGE_MAPS[language];
  if (!map) return text;

  let translated = text;
  for (const [native, english] of Object.entries(map)) {
    translated = translated.replace(new RegExp(native, 'gi'), english);
  }
  return translated;
}

export function parseVoiceCommand(transcript: string, language = 'en'): VoiceCommand {
  const english = translateToEnglish(transcript, language);
  const lower = english.toLowerCase();
  const words = lower.split(/\s+/);

  let action: TransactionType | 'check' | 'list' = 'add';
  let confidence = 0.5;

  for (const word of words) {
    if (ACTION_KEYWORDS[word]) {
      action = ACTION_KEYWORDS[word];
      confidence += 0.2;
      break;
    }
  }

  let item: string | undefined;
  for (const word of words) {
    if (ITEM_KEYWORDS[word]) {
      item = ITEM_KEYWORDS[word];
      confidence += 0.15;
      break;
    }
  }

  let unit: string | undefined;
  for (const word of words) {
    if (UNIT_KEYWORDS[word]) {
      unit = UNIT_KEYWORDS[word];
      confidence += 0.1;
      break;
    }
  }

  const quantity = extractNumber(english);
  if (quantity !== undefined) {
    confidence += 0.1;
  }

  const amountMatch = english.match(/(\d+)\s*(?:rupees|rs|inr)/i);
  const amount = amountMatch ? parseInt(amountMatch[1], 10) : undefined;
  if (amount) confidence += 0.05;

  confidence = Math.min(confidence, 0.99);

  return {
    transcript,
    intent: {
      action,
      quantity,
      unit: unit as any,
      item,
      amount,
    },
    confidence,
    language,
  };
}
