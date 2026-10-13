import { Token } from './tokenizer';

// Compile-only stub: gives the first parser test something to fail against.
export type Expr = { type: 'number'; value: number };

export function parse(_tokens: Token[]): Expr {
  return { type: 'number', value: 0 };
}
