export type TokenType = 'number' | 'operator';

export interface Token {
  type: TokenType;
  text: string;
}

const isDigit = (char: string): boolean => char >= '0' && char <= '9';

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < input.length) {
    if (/\s/.test(input[pos])) {
      pos++;
    } else if (isDigit(input[pos])) {
      const start = pos;
      while (pos < input.length && isDigit(input[pos])) pos++;
      tokens.push({ type: 'number', text: input.slice(start, pos) });
    } else {
      tokens.push({ type: 'operator', text: input[pos] });
      pos++;
    }
  }
  return tokens;
}
