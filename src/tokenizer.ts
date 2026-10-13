// Compile-only stub: gives the first test something to fail against.
export type TokenType = 'number';

export interface Token {
  type: TokenType;
  text: string;
}

export function tokenize(_input: string): Token[] {
  return [];
}
