import { Token } from './tokenizer';

export type Expr =
  | { type: 'number'; value: number }
  | { type: 'binary'; op: string; left: Expr; right: Expr };

const toNumber = (token: Token): Expr => ({ type: 'number', value: Number(token.text) });

export function parse(tokens: Token[]): Expr {
  const left = toNumber(tokens[0]);
  if (tokens.length === 1) return left;
  return { type: 'binary', op: tokens[1].text, left, right: toNumber(tokens[2]) };
}
