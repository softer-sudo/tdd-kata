import { parse } from '../src/parser';
import { Token } from '../src/tokenizer';

// Tokens are built by hand so these tests stay independent of the tokenizer.
const num = (text: string): Token => ({ type: 'number', text });

describe('parse', () => {
  it('turns a number token into a number node', () => {
    expect(parse([num('42')])).toEqual({ type: 'number', value: 42 });
  });
});
