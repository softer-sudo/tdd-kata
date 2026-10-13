import { Expr, parse } from '../src/parser';
import { Token } from '../src/tokenizer';

// Tokens are built by hand so these tests stay independent of the tokenizer.
const num = (text: string): Token => ({ type: 'number', text });
const op = (text: string): Token => ({ type: 'operator', text });
const lparen: Token = { type: 'lparen', text: '(' };
const rparen: Token = { type: 'rparen', text: ')' };

// Expected trees are spelled out with these literal builders.
const n = (value: number): Expr => ({ type: 'number', value });
const bin = (symbol: string, left: Expr, right: Expr): Expr => ({ type: 'binary', op: symbol, left, right });
const neg = (operand: Expr): Expr => ({ type: 'unary', op: '-', operand });

describe('parse', () => {
  it('turns a number token into a number node', () => {
    expect(parse([num('42')])).toEqual({ type: 'number', value: 42 });
  });

  it('turns number, operator, number into a binary node', () => {
    expect(parse([num('1'), op('+'), num('2')])).toEqual({
      type: 'binary',
      op: '+',
      left: { type: 'number', value: 1 },
      right: { type: 'number', value: 2 },
    });
  });

  it('groups operators of equal precedence to the left', () => {
    expect(parse([num('1'), op('-'), num('2'), op('-'), num('3')])).toEqual(
      bin('-', bin('-', n(1), n(2)), n(3)),
    );
  });

  it('binds * tighter than +', () => {
    expect(parse([num('1'), op('+'), num('2'), op('*'), num('3')])).toEqual(
      bin('+', n(1), bin('*', n(2), n(3))),
    );
  });

  it('lets parentheses override precedence', () => {
    const tokens = [lparen, num('1'), op('+'), num('2'), rparen, op('*'), num('3')];
    expect(parse(tokens)).toEqual(bin('*', bin('+', n(1), n(2)), n(3)));
  });

  it.each([
    ['at the start', [op('-'), num('5')], neg(n(5))],
    ['after an operator', [num('2'), op('*'), op('-'), num('3')], bin('*', n(2), neg(n(3)))],
  ])('turns a minus %s into a unary node', (_where, tokens, expected) => {
    expect(parse(tokens)).toEqual(expected);
  });
});
