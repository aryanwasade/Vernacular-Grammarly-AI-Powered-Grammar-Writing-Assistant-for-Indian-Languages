
import { LANGUAGE_RULES, GENERIC_RULES, type Rule } from './rules';

export interface Suggestion {
  original: string;
  suggestion: string;
  explanation: string;
  type: 'grammar' | 'spelling' | 'style' | 'tone';
}

export interface AnalysisResult {
  correctedText: string;
  suggestions: Suggestion[];
  summary: string;
}

/**
 * Advanced local rule-based analysis engine.
 * Detects grammar, spelling, and tone patterns without external LLMs.
 */
export async function analyzeText(text: string, language: string, tone: string): Promise<AnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 600));

  let correctedText = text;
  const suggestions: Suggestion[] = [];
  const appliedRuleIds = new Set<string>();

  const rulesToApply = [
    ...(LANGUAGE_RULES[language] || []),
    ...GENERIC_RULES
  ];

  // Apply rules
  rulesToApply.forEach(rule => {
    if (rule.tone && rule.tone !== tone.toLowerCase()) return;

    const matches = text.matchAll(rule.pattern);
    for (const match of matches) {
      const original = match[0];
      const replacement = typeof rule.replacement === 'function' 
        ? rule.replacement(match[0], ...match.slice(1))
        : rule.replacement;

      if (original !== replacement && !appliedRuleIds.has(rule.id + original)) {
        suggestions.push({
          original,
          suggestion: replacement,
          explanation: rule.explanation,
          type: rule.type
        });
        appliedRuleIds.add(rule.id + original);
      }
    }
    
    // Update the full text (simple global replacement for demo)
    if (typeof rule.replacement === 'string') {
      correctedText = correctedText.replace(rule.pattern, rule.replacement);
    } else {
      correctedText = correctedText.replace(rule.pattern, (m, ...args) => (rule.replacement as Function)(m, ...args));
    }
  });

  // Basic structural fallback
  if (correctedText === text && text.trim().length > 0) {
    if (!/[.!?\u0964]$/.test(correctedText)) {
      const punc = language === 'Hindi' ? '।' : '.';
      suggestions.push({
        original: "End of text",
        suggestion: punc,
        explanation: "Added sentence termination.",
        type: 'grammar'
      });
      correctedText += punc;
    }
  }

  return {
    correctedText,
    suggestions,
    summary: suggestions.length > 0 
      ? `Identified ${suggestions.length} linguistic refinements for ${language}.`
      : `Text appears grammatically sound for the selected ${tone} tone.`
  };
}
