export type TokenType = 'number';

export interface Token {
  type: TokenType;
  text: string;
}

export function tokenize(input: string): Token[] {
  return [{ type: 'number', text: input }];
}
