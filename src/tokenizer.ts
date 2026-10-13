export type TokenType = 'number' | 'ident' | 'operator' | 'lparen' | 'rparen' | 'comma';

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
    } else if (/[A-Za-z_]/.test(input[pos])) {
      const start = pos;
      while (pos < input.length && /\w/.test(input[pos])) pos++;
      tokens.push({ type: 'ident', text: input.slice(start, pos) });
    } else if (input[pos] in PUNCTUATION) {
      tokens.push({ type: PUNCTUATION[input[pos]], text: input[pos] });
      pos++;
    } else if ('+-*/'.includes(input[pos])) {
      tokens.push({ type: 'operator', text: input[pos] });
      pos++;
    } else {
      throw new Error(`Unexpected character '${input[pos]}' at position ${pos}`);
    }
  }
  return tokens;
}
