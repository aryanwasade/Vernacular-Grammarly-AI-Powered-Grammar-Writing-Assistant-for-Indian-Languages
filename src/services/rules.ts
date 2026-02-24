
export interface Rule {
  id: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  explanation: string;
  type: 'grammar' | 'spelling' | 'style' | 'tone';
  tone?: string;
}

export const LANGUAGE_RULES: Record<string, Rule[]> = {
  'Hindi': [
    // Grammar: Postpositions (ne, ko, se, etc.)
    {
      id: 'hi-grammar-1',
      pattern: /(\u092E\u0948\u0902)\s+(\u0928\u0947)/g, // मैं ने -> मैंने
      replacement: 'मैंने',
      explanation: "In Hindi, the ergative marker 'ne' is usually attached to the pronoun 'main'.",
      type: 'grammar'
    },
    // Grammar: Gender Agreement (Basic)
    {
      id: 'hi-grammar-2',
      pattern: /(\u0932\u0921\u093C\u0915\u0940)\s+([\u0900-\u097F]+)(\u0924\u093E)\s+(\u0939\u0948)/g, // लड़की ...ता है -> ...ती है
      replacement: (match, p1, p2) => `${p1} ${p2}ती है`,
      explanation: "Subject-verb agreement: 'Ladki' (feminine) requires the verb ending 'ti' instead of 'ta'.",
      type: 'grammar'
    },
    // Spelling: Common phonetic errors
    {
      id: 'hi-spelling-1',
      pattern: /\u0936\u093F\u0915\u094D\u0938\u093E/g, // शिक्सा -> शिक्षा
      replacement: 'शिक्षा',
      explanation: "Common spelling error: 'Shiksha' uses the conjunct 'ksha' (क्ष).",
      type: 'spelling'
    },
    // Tone: Formal endings
    {
      id: 'hi-tone-formal',
      pattern: /(\u0939\u0948)$/g, // है -> हैं (plural/formal)
      replacement: 'हैं',
      explanation: "Using 'hain' instead of 'hai' adds a layer of respect/formality.",
      type: 'tone',
      tone: 'formal'
    }
  ],
  'Bengali': [
    {
      id: 'bn-grammar-1',
      pattern: /(\u0986\u09AE\u09BF)\s+(\u0995\u09B0\u09C7)/g, // আমি করে -> আমি করি
      replacement: 'আমি করি',
      explanation: "Verb conjugation: 'Ami' (I) requires the verb ending 'i'.",
      type: 'grammar'
    }
  ]
};

export const GENERIC_RULES: Rule[] = [
  {
    id: 'gen-style-1',
    pattern: /\s{2,}/g,
    replacement: ' ',
    explanation: "Removed redundant spaces for better formatting.",
    type: 'style'
  }
];
