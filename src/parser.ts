import { Token } from './tokenizer';

export type Expr = { type: 'number'; value: number };

export function parse(tokens: Token[]): Expr {
  return { type: 'number', value: Number(tokens[0].text) };
}
