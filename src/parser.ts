import { Token } from './tokenizer';

export type Expr =
  | { type: 'number'; value: number }
  | { type: 'binary'; op: string; left: Expr; right: Expr };

const toNumber = (token: Token): Expr => ({ type: 'number', value: Number(token.text) });

export function parse(tokens: Token[]): Expr {
  let pos = 0;
  let left = toNumber(tokens[pos++]);
  while (pos < tokens.length) {
    const op = tokens[pos++].text;
    left = { type: 'binary', op, left, right: toNumber(tokens[pos++]) };
  }
  return left;
}
