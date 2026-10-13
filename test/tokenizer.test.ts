import { tokenize } from '../src/tokenizer';

describe('tokenize', () => {
  it('turns a single integer into a number token', () => {
    expect(tokenize('42')).toEqual([{ type: 'number', text: '42' }]);
  });

  it('separates numbers and operators', () => {
    expect(tokenize('1+23')).toEqual([
      { type: 'number', text: '1' },
      { type: 'operator', text: '+' },
      { type: 'number', text: '23' },
    ]);
  });

  it('ignores whitespace between tokens', () => {
    expect(tokenize(' 1 \t+  2 ')).toEqual([
      { type: 'number', text: '1' },
      { type: 'operator', text: '+' },
      { type: 'number', text: '2' },
    ]);
  });

  it('keeps a decimal point inside a number token', () => {
    expect(tokenize('3.14')).toEqual([{ type: 'number', text: '3.14' }]);
  });

  it('gives parentheses and commas their own token types', () => {
    expect(tokenize('(1,2)')).toEqual([
      { type: 'lparen', text: '(' },
      { type: 'number', text: '1' },
      { type: 'comma', text: ',' },
      { type: 'number', text: '2' },
      { type: 'rparen', text: ')' },
    ]);
  });
});
