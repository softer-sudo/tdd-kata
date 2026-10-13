import { parse } from '../src/parser';
import { Token } from '../src/tokenizer';

// Tokens are built by hand so these tests stay independent of the tokenizer.
const num = (text: string): Token => ({ type: 'number', text });
const op = (text: string): Token => ({ type: 'operator', text });

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
});
