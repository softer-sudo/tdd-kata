import * as kata from '../src';
import { Calculator, createCalculator, Expr, FunctionLookup, Token } from '../src';

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

describe('createCalculator (composition root: real parts wired together)', () => {
  it.each([
    ['2 + 3 * 4', 14],
    ['max(1, 2 + 3) * -2', -10],
    ['(1 + 2) * sqrt(16) / 4', 3],
  ])('evaluates %s', (source, expected) => {
    expect(createCalculator().calculate(source)).toBe(expected);
  });

  it('uses the registry and logger it is given instead of the defaults', () => {
    const registry: FunctionLookup = {
      get: (name) => (name === 'twice' ? (x) => x * 2 : undefined),
    };
    const logger = { debug: jest.fn(), warn: jest.fn() };

    const result = createCalculator({ registry, logger }).calculate('twice(4) + 1');

    expect(result).toBe(9);
    expect(logger.debug).toHaveBeenCalledWith('twice(4) = 8');
  });

  it('lets evaluator errors surface through the default wiring', () => {
    expect(() => createCalculator().calculate('nope(1)')).toThrow("Unknown function 'nope'");
  });
});

describe('public API (the package entry point)', () => {
  it('exports what a user needs to build and extend a calculator', () => {
    expect(kata).toEqual(
      expect.objectContaining({
        Calculator: expect.any(Function),
        createCalculator: expect.any(Function),
        Evaluator: expect.any(Function),
        FunctionRegistry: expect.any(Function),
        createDefaultRegistry: expect.any(Function),
        tokenize: expect.any(Function),
        parse: expect.any(Function),
      }),
    );
  });
});
