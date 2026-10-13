import { Calculator } from '../src';
import { Expr } from '../src/parser';
import { Token } from '../src/tokenizer';

describe('Calculator (every pipeline stage is injected and mocked)', () => {
  it('passes the source through tokenize, parse and evaluate, returning the evaluator result', () => {
    const tokens: Token[] = [{ type: 'number', text: '7' }];
    const ast: Expr = { type: 'number', value: 7 };
    const tokenize = jest.fn().mockReturnValue(tokens);
    const parse = jest.fn().mockReturnValue(ast);
    const evaluate = jest.fn().mockReturnValue(123);
    const calculator = new Calculator({ tokenize, parse, evaluator: { evaluate } });

    const result = calculator.calculate('seven');

    expect(tokenize).toHaveBeenCalledWith('seven');
    expect(parse).toHaveBeenCalledWith(tokens);
    expect(evaluate).toHaveBeenCalledWith(ast);
    expect(result).toBe(123);
  });
});
