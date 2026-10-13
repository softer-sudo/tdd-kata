export type TokenType = 'number' | 'ident' | 'operator' | 'lparen' | 'rparen' | 'comma';

export interface Token {
  type: TokenType;
  text: string;
}

const OPERATORS = '+-*/';
const PUNCTUATION: Record<string, TokenType> = { '(': 'lparen', ')': 'rparen', ',': 'comma' };

const isWhitespace = (char: string): boolean => /\s/.test(char);
const isNumberChar = (char: string): boolean => (char >= '0' && char <= '9') || char === '.';
const isIdentStart = (char: string): boolean => /[A-Za-z_]/.test(char);
const isIdentChar = (char: string): boolean => /\w/.test(char);

function readWhile(input: string, start: number, predicate: (char: string) => boolean): string {
  let end = start;
  while (end < input.length && predicate(input[end])) end++;
  return input.slice(start, end);
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < input.length) {
    const char = input[pos];
    if (isWhitespace(char)) {
      pos++;
      continue;
    }
    let token: Token;
    if (isNumberChar(char)) {
      token = { type: 'number', text: readWhile(input, pos, isNumberChar) };
    } else if (isIdentStart(char)) {
      token = { type: 'ident', text: readWhile(input, pos, isIdentChar) };
    } else if (char in PUNCTUATION) {
      token = { type: PUNCTUATION[char], text: char };
    } else if (OPERATORS.includes(char)) {
      token = { type: 'operator', text: char };
    } else {
      throw new Error(`Unexpected character '${char}' at position ${pos}`);
    }
    tokens.push(token);
    pos += token.text.length;
  }
  return tokens;
}
