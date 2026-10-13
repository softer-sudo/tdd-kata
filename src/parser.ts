import { Token } from './tokenizer';

export type Expr =
  | { type: 'number'; value: number }
  | { type: 'unary'; op: '-'; operand: Expr }
  | { type: 'call'; name: string; args: Expr[] }
  | { type: 'binary'; op: string; left: Expr; right: Expr };

export function parse(tokens: Token[]): Expr {
  let pos = 0;

  const parsePrimary = (): Expr => {
    const token = tokens[pos++];
    if (!token) throw new Error('Unexpected end of input');
    if (token.type === 'lparen') {
      const inner = parseExpression();
      if (tokens[pos]?.type !== 'rparen') {
        throw new Error(`Expected ')' but found '${tokens[pos]?.text}'`);
      }
      pos++;
      return inner;
    }
    if (token.type === 'ident') {
      pos++; // skip the opening parenthesis
      const args: Expr[] = [];
      if (tokens[pos]?.type !== 'rparen') {
        args.push(parseExpression());
        while (tokens[pos]?.type === 'comma') {
          pos++;
          args.push(parseExpression());
        }
      }
      pos++; // skip the closing parenthesis
      return { type: 'call', name: token.text, args };
    }
    if (token.type === 'number') return { type: 'number', value: Number(token.text) };
    throw new Error(`Unexpected token '${token.text}'`);
  };

  const parseUnary = (): Expr => {
    if (tokens[pos]?.text === '-') {
      pos++;
      return { type: 'unary', op: '-', operand: parseUnary() };
    }
    return parsePrimary();
  };

  // Left-associative chain of `operand (op operand)*` for the given operators.
  const parseChain = (ops: string[], parseOperand: () => Expr): Expr => {
    let left = parseOperand();
    while (pos < tokens.length && ops.includes(tokens[pos].text)) {
      const op = tokens[pos++].text;
      left = { type: 'binary', op, left, right: parseOperand() };
    }
    return left;
  };

  const parseTerm = (): Expr => parseChain(['*', '/'], parseUnary);
  const parseExpression = (): Expr => parseChain(['+', '-'], parseTerm);

  const expr = parseExpression();
  if (pos < tokens.length) throw new Error(`Unexpected token '${tokens[pos].text}'`);
  return expr;
}
