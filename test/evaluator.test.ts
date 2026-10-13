import { Evaluator, FunctionLookup, Logger } from '../src/evaluator';
import { BinaryOp, Expr } from '../src/parser';

// Both injected dependencies are test doubles: no real registry, no real logging.
const registry: jest.Mocked<FunctionLookup> = { get: jest.fn() };
const logger: jest.Mocked<Logger> = { debug: jest.fn(), warn: jest.fn() };

// ASTs are built by hand so these tests stay independent of the parser.
const n = (value: number): Expr => ({ type: 'number', value });
const bin = (op: BinaryOp, left: Expr, right: Expr): Expr => ({ type: 'binary', op, left, right });
const neg = (operand: Expr): Expr => ({ type: 'unary', op: '-', operand });
const call = (name: string, ...args: Expr[]): Expr => ({ type: 'call', name, args });

let evaluator: Evaluator;

beforeEach(() => {
  jest.resetAllMocks();
  evaluator = new Evaluator(registry, logger);
});

describe('Evaluator', () => {
  it('evaluates a number node to its value', () => {
    expect(evaluator.evaluate(n(42))).toBe(42);
  });

  it('adds the operands of a + node', () => {
    expect(evaluator.evaluate(bin('+', n(1), n(2)))).toBe(3);
  });

  it.each([
    ['-', 7, 2, 5],
    ['*', 3, 4, 12],
    ['/', 8, 2, 4],
  ] as const)('applies the %s operator', (op, left, right, expected) => {
    expect(evaluator.evaluate(bin(op, n(left), n(right)))).toBe(expected);
  });

  it('rejects division by zero instead of returning Infinity', () => {
    expect(() => evaluator.evaluate(bin('/', n(1), n(0)))).toThrow('Division by zero');
  });

  it('negates the operand of a unary minus', () => {
    expect(evaluator.evaluate(neg(bin('+', n(2), n(3))))).toBe(-5);
  });

  it('calls the function found in the injected registry with evaluated arguments', () => {
    const fn = jest.fn().mockReturnValue(99);
    registry.get.mockReturnValue(fn);

    const result = evaluator.evaluate(call('f', n(1), bin('+', n(2), n(3))));

    expect(registry.get).toHaveBeenCalledWith('f');
    expect(fn).toHaveBeenCalledWith(1, 5);
    expect(result).toBe(99);
  });

  it('rejects a call to a function the registry does not know', () => {
    registry.get.mockReturnValue(undefined);

    expect(() => evaluator.evaluate(call('nope', n(1)))).toThrow("Unknown function 'nope'");
  });

  it('reports each successful call to the injected logger', () => {
    registry.get.mockReturnValue(jest.fn().mockReturnValue(99));

    evaluator.evaluate(call('f', n(1), bin('+', n(2), n(3))));

    expect(logger.debug).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('f(1, 5) = 99');
  });

  it('warns through the injected logger when a function is unknown', () => {
    registry.get.mockReturnValue(undefined);

    expect(() => evaluator.evaluate(call('nope'))).toThrow("Unknown function 'nope'");

    expect(logger.warn).toHaveBeenCalledWith("Unknown function 'nope'");
    expect(logger.debug).not.toHaveBeenCalled();
  });
});
