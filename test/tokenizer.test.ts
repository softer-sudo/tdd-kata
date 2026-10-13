import { tokenize } from '../src/tokenizer';

describe('tokenize', () => {
  it('turns a single integer into a number token', () => {
    expect(tokenize('42')).toEqual([{ type: 'number', text: '42' }]);
  });
});
