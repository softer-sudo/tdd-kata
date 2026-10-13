import { Token } from './tokenizer';

export type Expr =
  | { type: 'number'; value: number }
  | { type: 'binary'; op: string; left: Expr; right: Expr };

export function parse(tokens: Token[]): Expr {
  let pos = 0;

  const parseNumber = (): Expr => ({ type: 'number', value: Number(tokens[pos++].text) });

  // Left-associative chain of `operand (op operand)*` for the given operators.
  const parseChain = (ops: string[], parseOperand: () => Expr): Expr => {
    let left = parseOperand();
    while (pos < tokens.length && ops.includes(tokens[pos].text)) {
      const op = tokens[pos++].text;
      left = { type: 'binary', op, left, right: parseOperand() };
    }
    return left;
  };

  const parseTerm = (): Expr => parseChain(['*', '/'], parseNumber);
  const parseExpression = (): Expr => parseChain(['+', '-'], parseTerm);

  return parseExpression();
}
