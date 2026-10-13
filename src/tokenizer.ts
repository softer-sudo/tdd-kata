export type TokenType = 'number' | 'operator' | 'lparen' | 'rparen' | 'comma';

export interface Token {
  type: TokenType;
  text: string;
}

const isNumberChar = (char: string): boolean => (char >= '0' && char <= '9') || char === '.';

const PUNCTUATION: Record<string, TokenType> = { '(': 'lparen', ')': 'rparen', ',': 'comma' };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < input.length) {
    if (/\s/.test(input[pos])) {
      pos++;
    } else if (isNumberChar(input[pos])) {
      const start = pos;
      while (pos < input.length && isNumberChar(input[pos])) pos++;
      tokens.push({ type: 'number', text: input.slice(start, pos) });
    } else if (input[pos] in PUNCTUATION) {
      tokens.push({ type: PUNCTUATION[input[pos]], text: input[pos] });
      pos++;
    } else {
      tokens.push({ type: 'operator', text: input[pos] });
      pos++;
    }
  }
  return tokens;
}
