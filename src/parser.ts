import { Token, TokenType } from './tokenizer';

export type BinaryOp = '+' | '-' | '*' | '/';

export type Expr =
  | { type: 'number'; value: number }
  | { type: 'unary'; op: '-'; operand: Expr }
  | { type: 'call'; name: string; args: Expr[] }
  | { type: 'binary'; op: BinaryOp; left: Expr; right: Expr };

/**
 * Recursive descent over:
 *   expression := term (('+' | '-') term)*
 *   term       := unary (('*' | '/') unary)*
 *   unary      := '-' unary | primary
 *   primary    := number | '(' expression ')' | ident '(' [expression (',' expression)*] ')'
 */
export function parse(tokens: Token[]): Expr {
  let pos = 0;

  const peekType = (): TokenType | undefined => tokens[pos]?.type;

  const peekOp = <T extends string>(ops: readonly T[]): T | undefined =>
    ops.find((op) => op === tokens[pos]?.text);

  const expectToken = (type: TokenType, symbol: string): void => {
    const token = tokens[pos];
    if (!token) throw new Error(`Expected '${symbol}' but reached end of input`);
    if (token.type !== type) throw new Error(`Expected '${symbol}' but found '${token.text}'`);
    pos++;
  };

  const parseCall = (name: string): Expr => {
    expectToken('lparen', '(');
    const args: Expr[] = [];
    if (peekType() !== 'rparen') {
      args.push(parseExpression());
      while (peekType() === 'comma') {
        pos++;
        args.push(parseExpression());
      }
    }
    expectToken('rparen', ')');
    return { type: 'call', name, args };
  };

  const parsePrimary = (): Expr => {
    const token = tokens[pos++];
    if (!token) throw new Error('Unexpected end of input');
    if (token.type === 'number') return { type: 'number', value: Number(token.text) };
    if (token.type === 'ident') return parseCall(token.text);
    if (token.type === 'lparen') {
      const inner = parseExpression();
      expectToken('rparen', ')');
      return inner;
    }
    throw new Error(`Unexpected token '${token.text}'`);
  };

  const parseUnary = (): Expr => {
    if (peekOp(['-'])) {
      pos++;
      return { type: 'unary', op: '-', operand: parseUnary() };
    }
    return parsePrimary();
  };

  const parseChain = (ops: readonly BinaryOp[], parseOperand: () => Expr): Expr => {
    let left = parseOperand();
    for (let op = peekOp(ops); op; op = peekOp(ops)) {
      pos++;
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
