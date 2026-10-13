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

  it('reads a run of letters, digits and underscores as one identifier', () => {
    expect(tokenize('log_2(8)')).toEqual([
      { type: 'ident', text: 'log_2' },
      { type: 'lparen', text: '(' },
      { type: 'number', text: '8' },
      { type: 'rparen', text: ')' },
    ]);
  });

  it.each(['+', '-', '*', '/'])('accepts %s as an operator', (op) => {
    expect(tokenize(op)).toEqual([{ type: 'operator', text: op }]);
  });

  it('rejects a character that is not part of the grammar, reporting where', () => {
    expect(() => tokenize('2 $ 3')).toThrow("Unexpected character '$' at position 2");
  });
});
